# blue_team_agent.py
from stable_baselines3 import DQN
from blue_team_environment import DefenseEnvironment
import numpy as np

class BlueTeamAgent:
    def __init__(self):
        # Create defense environment
        self.env = DefenseEnvironment()
        
        # Initialize DQN agent for defense
        self.model = DQN(
            "MlpPolicy",
            self.env,
            learning_rate=0.0005,
            buffer_size=50000,
            learning_starts=1000,
            target_update_interval=500,
            train_freq=4,
            exploration_fraction=0.4,
            exploration_initial_eps=1.0,
            exploration_final_eps=0.05,
            verbose=1
        )
    
    def train(self, total_timesteps=15000):
        """Train the Blue Team defense agent"""
        print("Training Blue Team Defense Agent...")
        self.model.learn(total_timesteps=total_timesteps)
        print("Blue Team training completed!")
    
    def test_agent(self, episodes=5):
        """Test the trained Blue Team agent"""
        print("\nTesting Blue Team Defense Agent...")
        
        for episode in range(episodes):
            obs, _ = self.env.reset()
            total_reward = 0
            steps = 0
            
            print(f"\n=== Episode {episode + 1} ===")
            
            while True:
                action, _ = self.model.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = self.env.step(action)
                total_reward += reward
                steps += 1
                
                # Decode and display action
                node_id = action // 3
                action_type = action % 3
                action_names = ["Monitor", "Deep_Scan", "Block_Node"]
                
                # Show current network status
                num_nodes = self.env.num_nodes
                attacks = obs[:num_nodes]
                blocked = obs[num_nodes:2*num_nodes]
                detections = obs[2*num_nodes:]
                
                print(f"Step {steps}: Action={action_names[action_type]} on Node_{node_id}")
                print(f"  Attacks: {attacks}")
                print(f"  Blocked: {blocked}")
                print(f"  Detection: {[f'{d:.2f}' for d in detections]}")
                print(f"  Reward: {reward:.1f}")
                
                if terminated or truncated:
                    break
            
            print(f"Episode {episode + 1} Result: Total Reward = {total_reward:.1f}, Steps = {steps}")
            
            # Show final status
            active_attacks = np.sum(obs[:num_nodes])
            if active_attacks == 0:
                print("✅ SUCCESS: All attacks neutralized!")
            else:
                print(f"⚠️  {int(active_attacks)} attacks still active")
    
    def save_model(self, path="blue_team_model"):
        """Save the trained model"""
        self.model.save(path)
        print(f"Blue Team model saved to {path}")
    
    def load_model(self, path="blue_team_model"):
        """Load a pre-trained model"""
        self.model = DQN.load(path, env=self.env)
        print(f"Blue Team model loaded from {path}")
