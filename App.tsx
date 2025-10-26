
import React, { useState, useMemo } from 'react';
import { Project, UploadedFile, BankStatement, Allocations, Client } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import TransactionAllocator from './components/TransactionAllocator';
import ProjectManager from './components/ProjectManager';
import FileManager from './components/FileManager';
import ClientManager from './components/ClientManager';
import { parseBankStatementXML } from './services/xmlParser';
import { AllocationIcon, ClientIcon, FileUploadIcon, ProjectIcon } from './components/icons';

type View = 'allocations' | 'projects' | 'files' | 'clients';

const initialProjects: Project[] = [
    { id: 'proj-1', displayId: '115', name: 'Casa Palma Irarrázaval', location: 'Paseo Alcalá, Lo Barnechea', status: 'Propuesta' },
    { id: 'proj-2', displayId: '131', name: 'Casa Pirque IO', location: 'Virginia Subercaseaux 3400', status: 'Propuesta' },
    { id: 'proj-3', displayId: '008', name: 'Casa Mujica Perez Canto', location: 'Lo Arcaya, Pirque', status: 'Propuesta' },
    { id: 'proj-4', displayId: '009', name: 'Patio Toro Labbe', location: 'Las Nevadas, Providencia', status: 'Propuesta' },
    { id: 'proj-5', displayId: '010', name: 'Quincho Radrigan Seisdedos', location: 'Puente de Piedra, Lo Barnechea', status: 'Propuesta' },
    { id: 'proj-6', displayId: '011', name: 'Casa Sofia Labra', location: 'Las Lavandulas, Las Condes', status: 'Propuesta' },
    { id: 'proj-7', displayId: '012', name: 'Casa del Solar Schaap', location: 'Puerta de Hierro, Lo Barnechea', status: 'Propuesta' },
    { id: 'proj-8', displayId: '013', name: 'Casa Javiera Ketterer', location: 'Quinta Hamburgo, Ñuñoa', status: 'Propuesta' },
    { id: 'proj-9', displayId: '014', name: 'Condominio CFV', location: 'Contralmirante Fernández Vial, Lo Barnechea', status: 'Propuesta' },
    { id: 'proj-10', displayId: '015', name: 'Casa Carmen Bilbeny', location: 'Camino a Farellones', status: 'Propuesta' },
    { id: 'proj-11', displayId: '016', name: 'Proyecto Mujica Perez Canto', location: 'Lo Arcaya, Pirque', status: 'Propuesta' },
    { id: 'proj-12', displayId: '017', name: 'Padre Ariztía', location: 'Padre Ariztía, Vitacura', status: 'Propuesta' },
    { id: 'proj-13', displayId: '018', name: 'Casa IFS', location: 'Walker Martinez, La Florida', status: 'Propuesta' },
    { id: 'proj-14', displayId: '019', name: 'SUITE Isidora', location: 'Fundo lo Aguirre, Talagante', status: 'Propuesta' },
    { id: 'proj-15', displayId: '020', name: 'Quincho TS (Torretti Sepulveda)', location: 'Campanario 341, Las Condes', status: 'Propuesta' },
    { id: 'proj-16', displayId: '021', name: 'Quincho GV (García Villagra)', location: 'Camino El Alba, Las Condes', status: 'Propuesta' },
];

const App: React.FC = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>('iiarq-projects', initialProjects);
  const [files, setFiles] = useLocalStorage<UploadedFile[]>('iiarq-files', []);
  const [allocations, setAllocations] = useLocalStorage<Allocations>('iiarq-allocations', {});
  const [clients, setClients] = useLocalStorage<Client[]>('iiarq-clients', []);
  const [activeView, setActiveView] = useState<View>('projects');

  const bankStatements = useMemo<BankStatement[]>(() => {
    return files
      .map(file => parseBankStatementXML(file.content, file.name))
      .filter((statement): statement is BankStatement => statement !== null)
      .sort((a, b) => new Date(a.period.from.split('-').reverse().join('-')).getTime() - new Date(b.period.from.split('-').reverse().join('-')).getTime());
  }, [files]);
  
  const NavButton = ({ view, label, icon }: { view: View, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeView === view
          ? 'bg-brand-highlight text-white'
          : 'text-gray-300 hover:bg-brand-accent hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-brand-primary text-brand-text">
      <header className="bg-brand-secondary shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold text-white">
                        <span className="text-brand-highlight">IIArq</span> Control de Gestión
                    </h1>
                </div>
                <nav className="flex space-x-2">
                    <NavButton view="allocations" label="Asignaciones" icon={<AllocationIcon />} />
                    <NavButton view="projects" label="Proyectos" icon={<ProjectIcon />} />
                    <NavButton view="clients" label="Clientes" icon={<ClientIcon />} />
                    <NavButton view="files" label="Archivos" icon={<FileUploadIcon />} />
                </nav>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'allocations' && <TransactionAllocator statements={bankStatements} projects={projects} allocations={allocations} setAllocations={setAllocations} />}
        {activeView === 'projects' && <ProjectManager projects={projects} setProjects={setProjects} clients={clients} />}
        {activeView === 'clients' && <ClientManager clients={clients} setClients={setClients} />}
        {activeView === 'files' && <FileManager files={files} setFiles={setFiles} />}
      </main>
      
      <footer className="bg-brand-secondary mt-8 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Isidora Irarrázaval Arquitectura. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;