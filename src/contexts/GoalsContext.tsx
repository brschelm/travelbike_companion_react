import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Goal, GoalFormData } from '../types';

interface GoalsContextType {
  goals: Goal[];
  addGoal: (goal: GoalFormData) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  markAsAchieved: (id: string) => void;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};

interface GoalsProviderProps {
  children: ReactNode;
}

export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    // Load goals from localStorage
    const savedGoals = localStorage.getItem('user_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save goals to localStorage whenever they change
    localStorage.setItem('user_goals', JSON.stringify(goals));
  }, [goals]);

  const addGoal = (goalData: GoalFormData) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      current: 0,
      value: goalData.target,
      endDate: goalData.deadline,
      achieved: false,
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const markAsAchieved = (id: string) => {
    updateGoal(id, { achieved: true });
  };

  const value: GoalsContextType = {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    markAsAchieved,
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};
