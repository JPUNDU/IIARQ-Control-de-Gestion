
import React, { useState } from 'react';
import { Client } from '../types';
import { EditIcon, PlusIcon, TrashIcon } from './icons';

interface ClientManagerProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const ClientForm: React.FC<{ client?: Client; onSave: (client: Client) => void; onCancel: () => void }> = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    name: client?.name || '',
    lastName: client?.lastName || '',
    email: client?.email || '',
    phone: client?.phone || '',
  });

  const [errors, setErrors] = useState<{ email?: string }>({});

  const validate = () => {
    const newErrors: { email?: string } = {};
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Formato de email inválido.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...formData, id: client?.id || Date.now().toString() });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-brand-secondary p-6 rounded-lg shadow-lg space-y-4 mb-8">
      <h3 className="text-xl font-bold text-white">{client ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre</label>
          <input type="text" id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2" />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">Apellido</label>
          <input type="text" id="lastName" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
          <input type="email" id="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2" />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Teléfono</label>
          <input type="tel" id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2" />
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-white bg-brand-accent hover:bg-gray-600">Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded-md text-white bg-brand-highlight hover:bg-teal-500 font-semibold">Guardar Cliente</button>
      </div>
    </form>
  )
}

const ClientManager: React.FC<ClientManagerProps> = ({ clients, setClients }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

  const handleSave = (client: Client) => {
    if (editingClient) {
      setClients(clients.map(c => c.id === client.id ? client : c));
    } else {
      setClients([...clients, client]);
    }
    setIsFormVisible(false);
    setEditingClient(undefined);
  };

  const handleDelete = (clientId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      setClients(clients.filter(c => c.id !== clientId));
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsFormVisible(true);
  }

  const handleAddNew = () => {
    setEditingClient(undefined);
    setIsFormVisible(true);
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Administrar Clientes</h2>
        {!isFormVisible && (
          <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 rounded-md text-white bg-brand-highlight hover:bg-teal-500 font-semibold">
            <PlusIcon />
            Nuevo Cliente
          </button>
        )}
      </div>

      {isFormVisible && <ClientForm client={editingClient} onSave={handleSave} onCancel={() => setIsFormVisible(false)} />}

      <div className="bg-brand-secondary shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-brand-accent">
            <tr>
              <th className="p-4 font-semibold">Nombre</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Teléfono</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-400">No hay clientes. ¡Crea uno nuevo para empezar!</td>
              </tr>
            ) : (
              clients.map(c => (
                <tr key={c.id} className="border-b border-brand-accent last:border-b-0 hover:bg-brand-primary/50">
                  <td className="p-4 font-medium text-white">{c.name} {c.lastName}</td>
                  <td className="p-4 text-gray-300">{c.email}</td>
                  <td className="p-4 text-gray-300">{c.phone}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => handleEdit(c)} className="p-2 text-gray-400 hover:text-white transition-colors"><EditIcon /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientManager;
