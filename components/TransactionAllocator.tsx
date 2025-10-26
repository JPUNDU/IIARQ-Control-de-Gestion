
import React, { useState, useMemo, useEffect } from 'react';
import { BankStatement, Transaction, Project, Allocation, ProratedSplit, Allocations } from '../types';
import ProrateModal from './ProrateModal';

interface TransactionAllocatorProps {
  statements: BankStatement[];
  projects: Project[];
  allocations: Allocations;
  setAllocations: React.Dispatch<React.SetStateAction<Allocations>>;
}

const TransactionAllocator: React.FC<TransactionAllocatorProps> = ({ statements, projects, allocations, setAllocations }) => {
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);
  const [proratingTransaction, setProratingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!selectedStatementId && statements.length > 0) {
      setSelectedStatementId(statements[statements.length - 1].id);
    }
  }, [statements, selectedStatementId]);
  
  const selectedStatement = useMemo(() => {
    return statements.find(s => s.id === selectedStatementId);
  }, [statements, selectedStatementId]);

  const handleAllocationChange = (transactionId: string, projectId: string | null) => {
    setAllocations(prev => ({
      ...prev,
      [transactionId]: { type: 'single', projectId: projectId }
    }));
  };

  const handleProrateSave = (transactionId: string) => (splits: ProratedSplit[]) => {
     setAllocations(prev => ({
      ...prev,
      [transactionId]: { type: 'prorated', splits }
    }));
  };
  
  const getProjectDisplay = (allocation: Allocation | undefined): string => {
    if (!allocation) return "Sin Asignar";
    if (allocation.type === 'single') {
        const project = projects.find(p => p.id === allocation.projectId);
        return project ? `[${project.displayId}]` : "Sin Asignar";
    }
    return "Prorrateado";
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">Asignación de Movimientos</h2>
        {statements.length > 0 ? (
          <div className="w-full md:w-auto">
            <label htmlFor="month-selector" className="text-sm font-medium text-gray-300 mr-2">Seleccionar Mes:</label>
            <select
              id="month-selector"
              value={selectedStatementId || ''}
              onChange={(e) => setSelectedStatementId(e.target.value)}
              className="bg-brand-secondary border border-brand-accent rounded-md shadow-sm p-2 text-white focus:ring-brand-highlight focus:border-brand-highlight"
            >
              {statements.map(s => (
                <option key={s.id} value={s.id}>{s.period.from} - {s.period.to}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {selectedStatement ? (
        <div className="bg-brand-secondary shadow-lg rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-accent">
              <tr>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Descripción</th>
                <th className="p-4 font-semibold text-right">Monto</th>
                <th className="p-4 font-semibold text-right">Saldo</th>
                <th className="p-4 font-semibold text-center w-1/4">Asignar a Proyecto</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {selectedStatement.transactions.map(tx => {
                  const allocation = allocations[tx.id];
                  return (
                    <tr key={tx.id} className="border-b border-brand-accent last:border-b-0 hover:bg-brand-primary/50">
                        <td className="p-4 whitespace-nowrap">{tx.date}</td>
                        <td className="p-4">{tx.description}</td>
                        <td className={`p-4 font-mono text-right whitespace-nowrap ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(tx.amount)}
                        </td>
                        <td className="p-4 font-mono text-right whitespace-nowrap text-gray-400">{formatCurrency(tx.balance)}</td>
                        <td className="p-4">
                            {allocation?.type === 'prorated' ? (
                                <div className="text-center font-bold text-brand-highlight">{getProjectDisplay(allocation)}</div>
                            ) : (
                                <select 
                                    value={allocation?.type === 'single' ? (allocation.projectId || '') : ''}
                                    onChange={e => handleAllocationChange(tx.id, e.target.value || null)}
                                    className="w-full bg-brand-accent border-gray-600 rounded-md text-white p-2"
                                >
                                    <option value="">Sin Asignar</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>[{p.displayId}] {p.name}</option>
                                    ))}
                                </select>
                            )}
                        </td>
                        <td className="p-4 text-center">
                            <button 
                                onClick={() => setProratingTransaction(tx)}
                                className="px-3 py-1 text-sm rounded-md text-white bg-brand-accent hover:bg-gray-600 font-semibold"
                            >
                                Prorratear
                            </button>
                        </td>
                    </tr>
                )})}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-12 bg-brand-secondary rounded-lg">
            <h3 className="text-xl font-semibold text-white">No hay cartolas bancarias cargadas</h3>
            <p className="text-gray-400 mt-2">Por favor, ve a la pestaña de 'Archivos' para subir un archivo XML.</p>
        </div>
      )}

      {proratingTransaction && (
        <ProrateModal
            transaction={proratingTransaction}
            projects={projects}
            allocation={allocations[proratingTransaction.id]}
            onSave={handleProrateSave(proratingTransaction.id)}
            onClose={() => setProratingTransaction(null)}
        />
      )}
    </div>
  );
};

export default TransactionAllocator;
