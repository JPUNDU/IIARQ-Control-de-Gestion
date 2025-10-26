
import React, { useState, useMemo } from 'react';
import { Transaction, Project, ProratedSplit, Allocation } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface ProrateModalProps {
  transaction: Transaction;
  projects: Project[];
  allocation: Allocation | undefined;
  onSave: (splits: ProratedSplit[]) => void;
  onClose: () => void;
}

const ProrateModal: React.FC<ProrateModalProps> = ({ transaction, projects, allocation, onSave, onClose }) => {
  
  const initialSplits = useMemo(() => {
    if (allocation && allocation.type === 'prorated' && allocation.splits.length > 0) {
      return allocation.splits;
    }
    return [{ id: Date.now().toString(), description: transaction.description, projectId: null, amount: transaction.amount }];
  }, [allocation, transaction]);
  
  const [splits, setSplits] = useState<ProratedSplit[]>(initialSplits);

  const totalProrated = useMemo(() => splits.reduce((sum, s) => sum + s.amount, 0), [splits]);
  const remainingAmount = transaction.amount - totalProrated;
  const isBalanced = Math.abs(remainingAmount) < 0.01;

  const handleSplitChange = <K extends keyof ProratedSplit,>(index: number, field: K, value: ProratedSplit[K]) => {
    const newSplits = [...splits];
    if (field === 'amount') {
      const numValue = Number(value);
      newSplits[index][field] = isNaN(numValue) ? 0 : numValue;
    } else {
      newSplits[index][field] = value;
    }
    setSplits(newSplits);
  };
  
  const addSplit = () => {
    setSplits([...splits, { id: Date.now().toString(), description: '', projectId: null, amount: 0 }]);
  };
  
  const removeSplit = (index: number) => {
    const newSplits = splits.filter((_, i) => i !== index);
    setSplits(newSplits);
  };

  const handleSave = () => {
    if (isBalanced) {
      onSave(splits);
      onClose();
    } else {
      alert('La suma de los montos prorrateados debe ser igual al monto total de la transacción.');
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Prorratear Transacción</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <div className="bg-brand-accent p-4 rounded-md mb-4 flex justify-between items-center text-white">
            <div>
                <p className="text-sm text-gray-300">{transaction.description}</p>
                <p className="text-lg font-bold">{formatCurrency(transaction.amount)}</p>
            </div>
            <div className={`text-right ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                <p className="text-sm">Restante</p>
                <p className="text-lg font-bold">{formatCurrency(remainingAmount)}</p>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
            {splits.map((split, index) => (
            <div key={split.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
                <input
                    type="text"
                    placeholder="Descripción"
                    value={split.description}
                    onChange={(e) => handleSplitChange(index, 'description', e.target.value)}
                    className="col-span-4 bg-brand-accent border-gray-600 rounded-md text-white p-2"
                />
                <select
                    value={split.projectId || ''}
                    onChange={(e) => handleSplitChange(index, 'projectId', e.target.value || null)}
                    className="col-span-4 bg-brand-accent border-gray-600 rounded-md text-white p-2"
                >
                    <option value="">Sin Asignar</option>
                    {projects.map(p => <option key={p.id} value={p.id}>[{p.displayId}] {p.name}</option>)}
                </select>
                <input
                    type="number"
                    step="0.01"
                    placeholder="Monto"
                    value={split.amount}
                    onChange={(e) => handleSplitChange(index, 'amount', parseFloat(e.target.value))}
                    className="col-span-3 bg-brand-accent border-gray-600 rounded-md text-white p-2"
                />
                <button onClick={() => removeSplit(index)} className="col-span-1 text-gray-400 hover:text-red-400 p-2 flex justify-center">
                    <TrashIcon />
                </button>
            </div>
            ))}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-brand-accent mt-4">
          <button onClick={addSplit} className="flex items-center gap-2 px-4 py-2 rounded-md text-white bg-brand-accent hover:bg-gray-600 font-semibold">
            <PlusIcon /> Añadir Fila
          </button>
          <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-md text-white bg-brand-accent hover:bg-gray-600">Cancelar</button>
              <button onClick={handleSave} disabled={!isBalanced} className="px-4 py-2 rounded-md text-white bg-brand-highlight hover:bg-teal-500 font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed">
                  Guardar Prorrateo
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProrateModal;
