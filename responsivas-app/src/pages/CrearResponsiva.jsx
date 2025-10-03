import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { ArchiveBoxArrowDownIcon, DocumentArrowDownIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';


// COMPONENTE REUTILIZABLE PARA CAMPOS DEL FORMULARIO
const FormField = ({ label, name, type = 'text', as = 'input', ...props }) => {
  const commonProps = {
    id: name,
    name: name,
    className: "input",
    ...props,
  };

  const InputComponent = as === 'textarea' ? 'textarea' : 'input';

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <InputComponent type={type} {...commonProps} />
    </div>
  );
};

// COMPONENTE SPINNER
const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);


export default function CrearResponsiva() {
  const [form, setForm] = useState({
    ciudad: 'Aguascalientes',
    fecha: '',
    responsable: '',
    empresa: 'IG Biogas',
    tipoEquipo: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    accesorios: '',
    estado: 'Nuevo',
    responsableArea: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [alerta, setAlerta] = useState({ msg: '', type: '' });

  useEffect(() => {
    setForm(prevForm => ({
      ...prevForm,
      fecha: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlerta({ msg: '', type: '' });

    try {
      const res = await fetch('http://localhost:3001/api/responsivas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Error del servidor');

      const data = await res.json();
      setAlerta({ msg: '✅ Responsiva guardada y PDF descargado.', type: 'success' });

      await generarPDF(form);
      setForm({
        ciudad: 'Aguascalientes', fecha: new Date().toISOString().split('T')[0], responsable: '',
        empresa: 'IG Biogas', tipoEquipo: '', marca: '', modelo: '', numeroSerie: '',
        accesorios: '', estado: 'Nuevo', responsableArea: '',
      });
      setTimeout(() => setAlerta({ msg: '', type: '' }), 5000);
    } catch (err) {
      console.error('Error al guardar la responsiva:', err);
      setAlerta({ msg: '❌ Error al guardar la responsiva.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- CÓDIGO COMPLETO DE LA FUNCIÓN generarPDF ---
  const generarPDF = async (formData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const left = 20;
    const right = pageWidth - 20;
    let y = 35;

    // Cargar logo como base64
    const cargarLogo = async () => {
      try {
        const res = await fetch('/logoig.png'); // Asegúrate que el logo esté en la carpeta /public
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("No se pudo cargar el logo:", error);
        return null; // Retornar nulo si hay error
      }
    };
    
    const base64Logo = await cargarLogo();
    if(base64Logo) {
      doc.addImage(base64Logo, 'PNG', left, 18, 30, 18);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('GRUPO IG', left + 35, 20);
    doc.setFontSize(14);
    doc.text('CARTA RESPONSIVA DE EQUIPO', pageWidth / 2, y, { align: 'center' });
    doc.setDrawColor(0);
    doc.line(left, y + 2, right, y + 2);
    y += 12;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const intro = `Por medio de la presente, yo, ${formData.responsable || '__________________________'}, manifiesto haber recibido del área de TI el siguiente equipo para el desempeño de mis funciones laborales:`;
    const introLines = doc.splitTextToSize(intro, pageWidth - 40);
    doc.text(introLines, left, y);
    y += introLines.length * 7 + 5;

    const equipo = [
      ['Tipo de equipo', formData.tipoEquipo],
      ['Marca', formData.marca],
      ['Modelo', formData.modelo],
      ['Número de serie', formData.numeroSerie],
      ['Accesorios incluidos', formData.accesorios],
      ['Estado del equipo', formData.estado],
    ];
    equipo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`- ${label}:`, left, y);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(value || '__________________________', pageWidth - left - 70);
      doc.text(lines, left + 50, y);
      y += lines.length * 7 + 2;
    });

    y += 5;

    const compromisos = [
      '1. Hacer uso del equipo única y exclusivamente para fines laborales.',
      '2. Conservar en buen estado el equipo que se me ha asignado.',
      '3. Reportar de inmediato cualquier incidente, daño o falla del equipo.',
      '4. No realizar alteraciones ni modificaciones sin autorización previa de la empresa.',
      '5. Devolver el equipo en las mismas condiciones en que fue recibido en caso de término de la relación laboral, cambio de puesto, o cualquier otra situación que requiera su regreso.',
    ];
    doc.setFont('helvetica', 'bold');
    doc.text('Me comprometo a:', left, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    compromisos.forEach((line) => {
      const lines = doc.splitTextToSize(line, pageWidth - 40);
      doc.text(lines, left, y);
      y += lines.length * 7;
    });

    y += 5;

    const cierre = `Asimismo, reconozco que el equipo entregado es propiedad de la empresa, y en caso de extravío, daño o robo, me comprometo a cubrir el monto total del equipo asignado.`;
    const cierreLines = doc.splitTextToSize(cierre, pageWidth - 40);
    doc.text(cierreLines, left, y);
    y += cierreLines.length * 7 + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre del empleado:', left, y);
    doc.text(formData.responsable || '__________________________', left + 60, y);
    y += 8;
    doc.text('Firma del empleado:', left, y);
    doc.line(left + 60, y, left + 140, y);
    y += 15;
    doc.text('Nombre y firma del responsable del área:', left, y);
    doc.line(left + 100, y, right, y);
    y += 20;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('IG Biogas   |   VitalWater   |   BIOENERGY', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text('Granja el chacho s/n F16, CP 20997, Jesús María, Aguascalientes, México', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text('T. +52 (449) 971 2000  |   www.igbiogas.com', pageWidth / 2, y, { align: 'center' });

    doc.save(`responsiva_${formData.responsable}_${formData.fecha}.pdf`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {alerta.msg && (
        <div className={`p-4 rounded-md flex items-center space-x-3 ${alerta.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {alerta.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
          <span className="text-sm font-medium">{alerta.msg}</span>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Información General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} />
          <FormField label="Fecha" name="fecha" type="date" value={form.fecha} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Datos del Empleado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nombre del Responsable" name="responsable" placeholder="Ej. Juan Pérez" value={form.responsable} onChange={handleChange} required />
          <FormField label="Empresa" name="empresa" value={form.empresa} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Detalles del Equipo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Tipo de Equipo" name="tipoEquipo" placeholder="Ej. Laptop, Monitor" value={form.tipoEquipo} onChange={handleChange} required />
          <FormField label="Marca" name="marca" placeholder="Ej. Dell, HP" value={form.marca} onChange={handleChange} required />
          <FormField label="Modelo" name="modelo" placeholder="Ej. Latitude 5420" value={form.modelo} onChange={handleChange} />
          <FormField label="Número de Serie" name="numeroSerie" placeholder="Ej. JHD562X" value={form.numeroSerie} onChange={handleChange} required />
          <FormField label="Estado del Equipo" name="estado" value={form.estado} onChange={handleChange} />
          <FormField label="Responsable de Área" name="responsableArea" placeholder="Responsable (Gerente)" value={form.responsableArea} onChange={handleChange} />
          <div className="md:col-span-2">
            <FormField label="Accesorios Incluidos" name="accesorios" as="textarea" placeholder="Ej. Cargador, mouse, maletín" value={form.accesorios} onChange={handleChange} rows={3} />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 flex justify-end gap-x-4">
        <button
          type="button"
          onClick={() => generarPDF(form)}
          className="flex items-center justify-center gap-x-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          <DocumentArrowDownIcon className='h-5 w-5'/>
          Descargar PDF
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : <ArchiveBoxArrowDownIcon className="h-5 w-5" />}
          Guardar y Descargar
        </button>
      </div>
    </form>
  );
}
