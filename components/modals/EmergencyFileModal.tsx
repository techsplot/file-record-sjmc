import React, { useState, useEffect } from 'react';
import { EmergencyFile, NewEmergencyFile, Gender } from '../../types';
import { XIcon } from '../icons';

interface EmergencyFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: NewEmergencyFile | EmergencyFile) => void;
  fileToEdit: EmergencyFile | null;
}

const EmergencyFileModal: React.FC<EmergencyFileModalProps> = ({ isOpen, onClose, onSave, fileToEdit }) => {
  const [formData, setFormData] = useState<NewEmergencyFile>({
    name: '',
    age: 0,
    gender: Gender.Other,
    registrationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  useEffect(() => {
    if (fileToEdit) {
      setFormData({
        name: fileToEdit.name,
        age: fileToEdit.age,
        gender: fileToEdit.gender,
        registrationDate: fileToEdit.registrationDate,
        expiryDate: fileToEdit.expiryDate
      });
    } else {
      setFormData({
        name: '', 
        age: 0, 
        gender: Gender.Other,
        registrationDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      });
    }
  }, [fileToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'age' ? (value === '' ? '' : parseInt(value) || 0) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileToEdit) {
      // When editing, include all fields including dates
      onSave({
        ...formData,
        id: fileToEdit.id,
        // Format dates to match MySQL datetime format
        registrationDate: formData.registrationDate ? new Date(formData.registrationDate).toISOString().slice(0, 19).replace('T', ' ') : fileToEdit.registrationDate,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString().slice(0, 19).replace('T', ' ') : fileToEdit.expiryDate
      });
    } else {
      // For new files, format the dates
      onSave({
        ...formData,
        registrationDate: new Date(formData.registrationDate).toISOString().slice(0, 19).replace('T', ' '),
        expiryDate: new Date(formData.expiryDate).toISOString().slice(0, 19).replace('T', ' ')
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XIcon className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {fileToEdit ? 'Edit Emergency File' : 'Add New Emergency File'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Patient Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sjmc-blue-light focus:border-sjmc-blue-light sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
              <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sjmc-blue-light focus:border-sjmc-blue-light sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sjmc-blue-light focus:border-sjmc-blue-light sm:text-sm">
                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700">Registration Date</label>
              <input 
                type="date" 
                name="registrationDate" 
                id="registrationDate" 
                value={formData.registrationDate?.split('T')[0]} 
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sjmc-blue-light focus:border-sjmc-blue-light sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input 
                type="date" 
                name="expiryDate" 
                id="expiryDate" 
                value={formData.expiryDate?.split('T')[0]} 
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sjmc-blue-light focus:border-sjmc-blue-light sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sjmc-blue-light">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sjmc-blue border border-transparent rounded-md shadow-sm hover:bg-sjmc-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sjmc-blue">
              Save File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyFileModal;
