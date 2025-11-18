import nmap, time

def run_scan(target):
    nm=nmap.PortScanner()
    print(f"Scanning {target}")
    nm.scan(target,arguments='-sV')
    print(nm.csv())
# red_team_agent.py
from defender_agent import CyberEnvironment
from stable_baselines3 import DQN
from stable_baselines3.common.env_util import make_vec_env
import numpy as np

class RedTeamAgent:
    def __init__(self):
        # Create environment
        self.env = CyberEnvironment()
        
        # Initialize DQN agent
        self.model = DQN(
            "MlpPolicy",
            self.env,
            learning_rate=0.001,
            buffer_size=10000,
            learning_starts=1000,
            target_update_interval=500,
            train_freq=4,
            gradient_steps=1,
            exploration_fraction=0.3,
            exploration_initial_eps=1.0,
            exploration_final_eps=0.05,
            verbose=1
        )
    
    def train(self, total_timesteps=10000):
        """Train the red team agent"""
        print("Training Red Team Agent...")
        self.model.learn(total_timesteps=total_timesteps)
        print("Training completed!")
    
    def test_agent(self, episodes=5):
        """Test the trained agent"""
        print("\nTesting Red Team Agent...")
        
        for episode in range(episodes):
            obs, _ = self.env.reset()  # Unpack to get only observation, discard info

            total_reward = 0
            steps = 0
            
            while True:
                action, _ = self.model.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = self.env.step(action)

                total_reward += reward
                steps += 1
                
                # Print actions for demonstration
                actions_names = ["Scan", "Exploit", "Move"]
                print(f"Step {steps}: Action={actions_names[action]}, "
                      f"Position={obs[0]:.0f}, Vulnerabilities={obs[1]:.0f}, "
                      f"Detection={obs[2]:.2f}, Reward={reward}")
                
                if terminated or truncated:

                    break
            
            print(f"Episode {episode + 1}: Total Reward = {total_reward}, Steps = {steps}\n")
    
    def save_model(self, path="red_team_model"):
        """Save the trained model"""
        self.model.save(path)
        print(f"Model saved to {path}")
    
    def load_model(self, path="red_team_model"):
        """Load a pre-trained model"""
        self.model = DQN.load(path, env=self.env)
        print(f"Model loaded from {path}")

if __name__=="__main__":
    target="192.168.56.101"
    while True:
        run_scan(target)
        time.sleep(60)
