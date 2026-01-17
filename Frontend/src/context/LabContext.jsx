import React, { createContext, useState, useContext } from 'react';
import { labAPI, materialAPI } from '../services/api';

const LabContext = createContext(null);

export const LabProvider = ({ children }) => {
  const [labs, setLabs] = useState([]);
  const [currentLab, setCurrentLab] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all labs
  const fetchLabs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await labAPI.getAllLabs();
      setLabs(response.data.labs || response.data);
      return response.data.labs || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch labs');
      console.error('Error fetching labs:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific lab details
  const fetchLabById = async (labId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await labAPI.getLabById(labId);
      setCurrentLab(response.data.lab || response.data);
      return response.data.lab || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch lab details');
      console.error('Error fetching lab:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch materials for a specific lab
  const fetchLabMaterials = async (labId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await labAPI.getLabMaterials(labId);
      setMaterials(response.data.materials || response.data);
      return response.data.materials || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch materials');
      console.error('Error fetching materials:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch single material details
  const fetchMaterialById = async (materialId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialAPI.getMaterialById(materialId);
      return response.data.material || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch material details');
      console.error('Error fetching material:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  const value = {
    labs,
    currentLab,
    materials,
    loading,
    error,
    fetchLabs,
    fetchLabById,
    fetchLabMaterials,
    fetchMaterialById,
    clearError,
  };

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};

export default LabContext;
