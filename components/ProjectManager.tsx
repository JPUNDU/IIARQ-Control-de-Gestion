
import React, { useState } from 'react';
import { Project, Client, ProjectStatus, projectStatuses } from '../types';
import { EditIcon, PlusIcon, TrashIcon } from './icons';

interface ProjectManagerProps {
  projects: Project[];
  setProjects: {
    add: (project: Omit<Project, 'id'>) => Promise<any>;
    update: (project: Project) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
  clients: Client[];
}

const ProjectForm: React.FC<{ project?: Project; clients: Client[]; onSave: (project: Project | Omit<Project, 'id'>) => void; onCancel: () => void }> = ({ project, clients, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    displayId: project?.displayId || '',
    name: project?.name || '',
    description: project?.description || '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    mainClientId: project?.mainClientId || '',
    secondaryClientIds: project?.secondaryClientIds || [],
    location: project?.location || '',
    status: project?.status || 'Propuesta',
  });
  
  const [errors, setErrors] = useState<{displayId?: string; name?: string}>({});

  const validate = () => {
    const newErrors: {displayId?: string; name?: string} = {};
    if (formData.displayId.length !== 3) newErrors.displayId = "ID debe tener 3 caracteres.";
    if (formData.name.length < 5) newErrors.name = "Nombre debe tener al menos 5 caracteres.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (project) {
        onSave({ ...formData, id: project.id });
    } else {
        onSave(formData);
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => (option as HTMLOptionElement).value);
    setFormData({ ...formData, secondaryClientIds: selectedIds });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-brand-secondary p-6 rounded-lg shadow-lg space-y-4 mb-8">
        <h3 className="text-xl font-bold text-white">{project ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="displayId" className="block text-sm font-medium text-gray-300">ID del Proyecto (3 caracteres)</label>
                <input type="text" id="displayId" value={formData.displayId} onChange={e => setFormData({...formData, displayId: e.target.value.toUpperCase()})} maxLength={3} required className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2" />
                {errors.displayId && <p className="text-red-400 text-sm mt-1">{errors.displayId}</p>}
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre del Proyecto</label>
                <input type="text" id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} minLength={5} required className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2" />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
        </div>
         <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Descripción</label>
            <textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300">Ubicación</label>
                <input type="text" id="location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2" />
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300">Estado</label>
                <select id="status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})} className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2">
                    {projectStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Fecha de Inicio</label>
                <input type="date" id="startDate" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2" />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">Fecha de Fin</label>
                <input type="date" id="endDate" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2" />
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="mainClientId" className="block text-sm font-medium text-gray-300">Cliente Principal</label>
                <select id="mainClientId" value={formData.mainClientId} onChange={e => setFormData({...formData, mainClientId: e.target.value})} className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2">
                    <option value="">Seleccionar cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.lastName}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="secondaryClientIds" className="block text-sm font-medium text-gray-300">Clientes Secundarios</label>
                <select id="secondaryClientIds" multiple value={formData.secondaryClientIds} onChange={handleMultiSelectChange} className="mt-1 block w-full bg-brand-accent border-gray-600 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-white p-2 h-24">
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.lastName}</option>)}
                </select>
            </div>
        </div>
        <div className="flex justify-end space-x-3">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-white bg-brand-accent hover:bg-gray-600">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-brand-highlight hover:bg-teal-500 font-semibold">Guardar Proyecto</button>
        </div>
    </form>
  )
}


const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, setProjects, clients }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  const handleSave = async (projectData: Project | Omit<Project, 'id'>) => {
    if ('id' in projectData) {
      await setProjects.update(projectData as Project);
    } else {
      await setProjects.add(projectData);
    }
    setIsFormVisible(false);
    setEditingProject(undefined);
  };
  
  const handleDelete = (projectId: string) => {
    if(window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        setProjects.delete(projectId);
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormVisible(true);
  }

  const handleAddNew = () => {
    setEditingProject(undefined);
    setIsFormVisible(true);
  }
  
  const getClientName = (clientId?: string) => {
      if (!clientId) return 'N/A';
      const client = clients.find(c => c.id === clientId);
      return client ? `${client.name} ${client.lastName}` : 'Cliente no encontrado';
  }

  const getStatusBadgeColor = (status?: ProjectStatus) => {
    const defaultClasses = 'px-2 py-1 text-xs font-semibold rounded-full inline-block';
    switch (status) {
      case 'Propuesta': return `${defaultClasses} bg-blue-500 text-white`;
      case 'Levantamiento': return `${defaultClasses} bg-cyan-500 text-white`;
      case 'Anteproyecto': return `${defaultClasses} bg-indigo-500 text-white`;
      case 'Proyecto': return `${defaultClasses} bg-purple-500 text-white`;
      case 'Licitación': return `${defaultClasses} bg-orange-500 text-white`;
      case 'Construcción': return `${defaultClasses} bg-yellow-500 text-gray-800`;
      case 'Terminado': return `${defaultClasses} bg-green-500 text-white`;
      case 'Perdido': return `${defaultClasses} bg-red-500 text-white`;
      default: return `${defaultClasses} bg-gray-500 text-white`;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Administrar Proyectos</h2>
        {!isFormVisible && (
          <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 rounded-md text-white bg-brand-highlight hover:bg-teal-500 font-semibold">
            <PlusIcon />
            Nuevo Proyecto
          </button>
        )}
      </div>

      {isFormVisible && <ProjectForm project={editingProject} clients={clients} onSave={handleSave} onCancel={() => setIsFormVisible(false)} />}

      <div className="bg-brand-secondary shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-brand-accent">
            <tr>
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nombre</th>
              <th className="p-4 font-semibold">Cliente Principal</th>
              <th className="p-4 font-semibold">Ubicación</th>
              <th className="p-4 font-semibold">Estado</th>
              <th className="p-4 font-semibold">Fechas</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
                <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-400">No hay proyectos. ¡Crea uno nuevo para empezar!</td>
                </tr>
            ) : (
                projects.map(p => (
                    <tr key={p.id} className="border-b border-brand-accent last:border-b-0 hover:bg-brand-primary/50">
                        <td className="p-4 font-mono text-brand-highlight">{p.displayId}</td>
                        <td className="p-4 font-medium text-white">{p.name}</td>
                        <td className="p-4 text-gray-300">{getClientName(p.mainClientId)}</td>
                        <td className="p-4 text-gray-300">{p.location || 'N/A'}</td>
                        <td className="p-4"><span className={getStatusBadgeColor(p.status)}>{p.status || 'N/A'}</span></td>
                        <td className="p-4 text-gray-300 whitespace-nowrap">{p.startDate || '?'} - {p.endDate || '?'}</td>
                        <td className="p-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                                <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-white transition-colors"><EditIcon /></button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><TrashIcon /></button>
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

export default ProjectManager;
