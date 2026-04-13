import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  User, 
  MapPin, 
  Settings, 
  Plus, 
  Trash2, 
  Eye, 
  Copy, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  FileText,
  ExternalLink,
  Globe,
  Smartphone,
  Camera,
  Lock,
  Wind,
  Layers,
  CreditCard,
  Truck,
  UserPlus,
  Briefcase,
  Sparkles,
  Loader2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for Tailwind class merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type TaxType = 'IVA' | 'IGIC' | 'IPSI';
type ManagementType = '1110' | '1105';
type Language = 'es' | 'en';

interface DeviceQuantities {
  mag?: number;
  foto?: number;
  arlo?: number;
  smart?: number;
  humo?: number;
  peri?: number;
}

interface LocationData {
  id: string;
  address: string;
  tax: TaxType;
  enableTemp: boolean;
  tempMonths: string;
  temp: string;
  enablePerm: boolean;
  perm: string;
  enableActualiza: boolean;
  enableAmpli: boolean;
  devices: DeviceQuantities;
  enableAsume: boolean;
  enableTraslado: boolean;
  enableANP: boolean;
  gift: '100' | '120' | null;
  extraDevices: string[];
}

interface ClientData {
  treatment: string;
  name: string;
  dni: string;
  language: Language;
}

interface LegalData {
  clientNum: string;
  matricula: string;
  titularSD: string;
  dniSD: string;
  dirSD: string;
  email: string;
  company: string;
  titularComp: string;
  dniComp: string;
  dirComp: string;
  installDate: string;
  cartaPromo: string;
  avisoBaja: string;
  obs: string;
  diffTitular: boolean;
  diffDir: boolean;
}

// --- Constants & Translations ---

const TRANSLATIONS = {
  es: {
    intro1110: `Hemos contactado con usted recientemente para hablar sobre su instalación de Verisure. Sabemos que ha tomado la decisión de cambiar de compañía, y entendemos que nuestra propuesta pueda parecer tardía. Queremos expresarle nuestra sincera disculpa por no haberle presentado nuestras mejores condiciones antes.<br><br>Sabemos que la seguridad de su hogar o negocio es una prioridad, y por eso estamos aquí para ofrecerle una reconexión de su sistema de alarma con mejores condiciones y una atención más personalizada, que pueda ajustarse mejor a sus necesidades actuales.<br><br>Le detallamos nuestra nueva oferta, esperando que reconsidere la posibilidad de reconectar su sistema con nosotros:`,
    intro1105: `<p style="margin-bottom:15px;">Queremos trasladar nuestro agradecimiento por la confianza depositada en Verisure y, desde el máximo respeto, poner a su disposición la posibilidad de gestionar el sistema de la forma que mejor se ajuste a la situación actual, evitando que la inversión realizada en su momento se pierda.</p><p style="margin-bottom:15px;">Quedamos a su disposición para atenderle y orientarle, sin compromiso alguno.</p>`,
    permFee: "Cuota permanente",
    update: "Actualización a Tecnología PreSense™",
    updateDesc: "Renovación completa de su sistema actual sin coste de instalación.",
    equip: "Equipamiento Adicional Incluido:",
    transfer: "Traslado de Sistema Sin Coste",
    transferDesc: "Nos encargamos de mover su seguridad a su nueva ubicación de forma gratuita.",
    anp: "Alta Nuevo Propietario (ANP) Sin Coste",
    anpDesc: "Gestión de cambio de titularidad sin cargos adicionales.",
    gift: "Tarjeta Regalo",
    giftDesc: "Importe de cortesía por su fidelidad.",
    asume: "Asumimos la Permanencia",
    asumeDesc: "Desde Verisure le brindaremos la facilidad y el apoyo para gestionar la baja de su anterior compañía de seguridad, y se le otorgará la carta compromiso, en la que nos comprometemos a hacernos cargo de cualquier importe que corresponda pagar a la otra compañía en consecuencia de esta cancelación.",
    footer: "Tecnología PreSense™ | Respuesta en <20s | Aviso a Policía",
    disclaimerHeader: "GARANTÍA DE ATENCIÓN EXCLUSIVA",
    disclaimer: "Estas condiciones no lo comprometen a permanencia y han sido habilitadas exclusivamente para usted, como muestra de nuestro compromiso por mantener el nivel de seguridad y atención que siempre ha tenido con Verisure."
  },
  en: {
    intro1110: `We have recently contacted you regarding your Verisure installation. We know you have decided to switch companies, and we understand that our proposal might seem late. We want to sincerely apologize for not presenting our best conditions sooner.<br><br>We know that the security of your home or business is a priority, and that is why we are here to offer you a reconnection of your alarm system with better conditions and a more personalized attention, which can better adjust to your current needs.<br><br>We detail our new offer below, hoping you will reconsider the possibility of reconnecting your system with us:`,
    intro1105: `<p style="margin-bottom:15px;">We want to express our gratitude for the trust placed in Verisure and, with the utmost respect, offer you the possibility of managing the system in the way that best fits your current situation, avoiding the loss of the investment made at the time.</p><p style="margin-bottom:15px;">We remain at your disposal to assist and guide you, without any commitment.</p>`,
    permFee: "Permanent fee",
    update: "Upgrade to PreSense™ Technology",
    updateDesc: "Complete renewal of your current system with no installation cost.",
    equip: "Additional Equipment Included:",
    transfer: "System Transfer at No Cost",
    transferDesc: "We take care of moving your security to your new location for free.",
    anp: "New Owner Registration (ANP) at No Cost",
    anpDesc: "Change of ownership management without additional charges.",
    gift: "Gift Card",
    giftDesc: "Courtesy amount for your loyalty.",
    asume: "We Assume the Permanence",
    asumeDesc: "Verisure will provide you with the ease and support to manage the cancellation with your previous security company, and you will be granted the commitment letter, in which we undertake to take charge of any amount corresponding to pay to the other company as a result of this cancellation.",
    footer: "PreSense™ Technology | Response in <20s | Police Notification",
    disclaimerHeader: "EXCLUSIVE SERVICE GUARANTEE",
    disclaimer: "These conditions do not commit you to permanence and have been enabled exclusively for you, as a sign of our commitment to maintaining the level of security and attention you have always had with Verisure."
  }
};

const DEVICE_NAMES: Record<keyof DeviceQuantities, string> = {
  mag: 'Magnéticos Sísmicos',
  foto: 'Fotodetectores',
  arlo: 'Cámara Arlo Pro',
  smart: 'Smartlock',
  humo: 'Detector Humo/Incendio',
  peri: 'Detector Perimetral'
};

const DEVICE_ICONS: Record<keyof DeviceQuantities, React.ReactNode> = {
  mag: <Smartphone className="w-4 h-4" />,
  foto: <Camera className="w-4 h-4" />,
  arlo: <Camera className="w-4 h-4" />,
  smart: <Lock className="w-4 h-4" />,
  humo: <Wind className="w-4 h-4" />,
  peri: <Layers className="w-4 h-4" />
};

// --- Helper Components ---

const Switch = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) => (
  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
    {label && <span className="text-xs font-semibold text-gray-700">{label}</span>}
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
        checked ? "bg-red-600" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  </div>
);

const Input = ({ label, value, onChange, type = "text", placeholder, prefix, suffix, className }: any) => (
  <div className={cn("space-y-1", className)}>
    {label && <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</label>}
    <div className="relative">
      {prefix && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{prefix}</div>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full px-3 py-2 bg-gray-50 border-2 border-transparent rounded-lg text-sm transition-all focus:outline-none focus:border-red-500 focus:bg-white",
          prefix && "pl-8",
          suffix && "pr-8"
        )}
      />
      {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{suffix}</div>}
    </div>
  </div>
);

const Select = ({ label, value, onChange, options, className }: any) => (
  <div className={cn("space-y-1", className)}>
    {label && <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-gray-50 border-2 border-transparent rounded-lg text-sm transition-all focus:outline-none focus:border-red-500 focus:bg-white appearance-none cursor-pointer"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'client' | 'legal'>('client');
  const [managementType, setManagementType] = useState<ManagementType>('1110');
  const [client, setClient] = useState<ClientData>({
    treatment: 'Sr.',
    name: '',
    dni: '',
    language: 'es'
  });
  const [locations, setLocations] = useState<LocationData[]>([
    {
      id: '0',
      address: '',
      tax: 'IVA',
      enableTemp: true,
      tempMonths: '12',
      temp: '0.00',
      enablePerm: true,
      perm: '0.00',
      enableActualiza: true,
      enableAmpli: false,
      devices: {},
      enableAsume: false,
      enableTraslado: false,
      enableANP: false,
      gift: null,
      extraDevices: []
    }
  ]);
  const [currentLocIndex, setCurrentLocIndex] = useState(0);
  const [legal, setLegal] = useState<LegalData>({
    clientNum: '',
    matricula: '',
    titularSD: '',
    dniSD: '',
    dirSD: '',
    email: '',
    company: '',
    titularComp: '',
    dniComp: '',
    dirComp: '',
    installDate: '',
    cartaPromo: 'SI',
    avisoBaja: '',
    obs: '',
    diffTitular: false,
    diffDir: false
  });
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [aiSituation, setAiSituation] = useState('');
  const [customIntro, setCustomIntro] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [activeModel, setActiveModel] = useState(() => localStorage.getItem('sd_active_model') || 'gemini-3-flash-preview');
  const [isCheckingApi, setIsCheckingApi] = useState(false);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! }), []);

  // --- Effects ---

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync legal fields with client data
  useEffect(() => {
    setLegal(prev => ({
      ...prev,
      titularSD: client.name,
      dniSD: client.dni,
      dirSD: locations[0]?.address || '',
      titularComp: !prev.diffTitular ? client.name : prev.titularComp,
      dniComp: !prev.diffTitular ? client.dni : prev.dniComp,
      dirComp: !prev.diffDir ? (locations[0]?.address || '') : prev.dirComp
    }));
  }, [client, locations]);

  // --- Handlers ---

  const updateLocation = (index: number, data: Partial<LocationData>) => {
    const newLocs = [...locations];
    newLocs[index] = { ...newLocs[index], ...data };
    setLocations(newLocs);
  };

  const addLocation = () => {
    const newLoc: LocationData = {
      id: Date.now().toString(),
      address: '',
      tax: 'IVA',
      enableTemp: true,
      tempMonths: '12',
      temp: '0.00',
      enablePerm: true,
      perm: '0.00',
      enableActualiza: true,
      enableAmpli: false,
      devices: {},
      enableAsume: false,
      enableTraslado: false,
      enableANP: false,
      gift: null,
      extraDevices: []
    };
    setLocations([...locations, newLoc]);
    setCurrentLocIndex(locations.length);
  };

  const removeLocation = (index: number) => {
    if (locations.length <= 1) return;
    const newLocs = locations.filter((_, i) => i !== index);
    setLocations(newLocs);
    setCurrentLocIndex(Math.max(0, index - 1));
  };

  const updateDeviceQty = (locIndex: number, deviceId: keyof DeviceQuantities, delta: number) => {
    const loc = locations[locIndex];
    const currentQty = loc.devices[deviceId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    const newDevices = { ...loc.devices };
    if (newQty === 0) delete newDevices[deviceId];
    else newDevices[deviceId] = newQty;

    updateLocation(locIndex, { devices: newDevices });
  };

  const toggleDevice = (locIndex: number, deviceId: keyof DeviceQuantities) => {
    const loc = locations[locIndex];
    const isSelected = !!loc.devices[deviceId];
    
    const newDevices = { ...loc.devices };
    if (isSelected) delete newDevices[deviceId];
    else newDevices[deviceId] = 1;

    updateLocation(locIndex, { devices: newDevices });
  };

  const showToast = (msg: string) => setToast(msg);

  const resetForm = () => {
    if (window.confirm('¿Desea limpiar todos los datos?')) {
      window.location.reload();
    }
  };

  const generateAIText = async () => {
    if (!aiSituation.trim()) {
      alert('Por favor, describa la situación del cliente para que la IA pueda trabajar.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const systemInstruction = `Eres un experto en retención de clientes para Verisure. Tu objetivo es redactar un párrafo introductorio para una propuesta comercial y determinar qué dispositivos o servicios adicionales se deben añadir según la descripción del agente.
      
      REGLAS DE SEGURIDAD CRÍTICAS:
      1. NO incluyas NOMBRES REALES, DNI, TELÉFONOS o DIRECCIONES en el texto generado.
      2. Si la entrada contiene datos personales, ignóralos y usa términos genéricos.
      
      REGLAS DE REDACCIÓN:
      - Tenga tacto y empatía con la situación descrita.
      - Sea profesional y comercial, buscando la continuidad del contrato.
      - Máximo 4-5 líneas.
      - Idioma: ${client.language === 'es' ? 'Español' : 'Inglés'}.
      - Sin saludos ni despedidas.
      - IMPORTANTE: El texto DEBE terminar SIEMPRE con una frase de transición como "por eso ofrecemos lo siguiente:", "por eso adaptamos la siguiente propuesta para usted:" o similar.
      
      REGLAS DE DISPOSITIVOS:
      - Analiza si el agente menciona ampliar dispositivos o servicios.
      - Identifica dispositivos estándar: mag (magnéticos), foto (fotodetectores), arlo (cámaras), smart (smartlock), humo (humo), peri (perimetral).
      - Identifica servicios o dispositivos EXTRA que no estén en la lista.
      - EXCLUSIONES CRÍTICAS (NO añadir como extra si se mencionan):
        * "Actualización del sistema de alarmas" (ya tiene su propio control).
        * "Cambio de titularidad" o "ANP" (ya tiene su propio control).
        * "Traslado de alarma" o "Traslado sin costo" (ya tiene su propio control).
      
      Debes responder en formato JSON estrictamente.`;

      const response = await ai.models.generateContent({
        model: activeModel,
        contents: `Situación (SÓLO CONTEXTO, SIN PII): ${aiSituation}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              introText: { 
                type: Type.STRING,
                description: "El párrafo de introducción empático y comercial que termina con la frase de transición."
              },
              standardDevices: {
                type: Type.OBJECT,
                properties: {
                  mag: { type: Type.INTEGER },
                  foto: { type: Type.INTEGER },
                  arlo: { type: Type.INTEGER },
                  smart: { type: Type.INTEGER },
                  humo: { type: Type.INTEGER },
                  peri: { type: Type.INTEGER }
                },
                description: "Cantidades de dispositivos estándar a añadir o establecer si se mencionan."
              },
              extraDevices: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista de servicios o dispositivos adicionales NO estándar mencionados (ej: 'GESTOR PERSONAL')."
              }
            },
            required: ["introText", "standardDevices", "extraDevices"]
          }
        },
      });

      const result = JSON.parse(response.text || '{}');
      if (result.introText) {
        setCustomIntro(result.introText.trim());
        
        // Update current location with devices
        const loc = locations[currentLocIndex];
        const updatedDevices = { ...loc.devices };
        let hasChanges = false;

        if (result.standardDevices) {
          Object.entries(result.standardDevices).forEach(([id, qty]) => {
            if (typeof qty === 'number' && qty > 0) {
              updatedDevices[id as keyof DeviceQuantities] = qty;
              hasChanges = true;
            }
          });
        }

        const newExtraDevices = [...(loc.extraDevices || []), ...(result.extraDevices || [])];
        // Remove duplicates
        const uniqueExtra = Array.from(new Set(newExtraDevices));
        if (uniqueExtra.length !== (loc.extraDevices || []).length) hasChanges = true;

        if (hasChanges || result.introText) {
          updateLocation(currentLocIndex, { 
            devices: updatedDevices,
            extraDevices: uniqueExtra,
            enableAmpli: uniqueExtra.length > 0 || Object.values(updatedDevices).some(q => (q as number) > 0)
          });
        }

        showToast('✨ Propuesta adaptada con éxito por la IA');
      }
    } catch (error) {
      console.error('Error generating AI text:', error);
      // Try to auto-fix if it's a model error
      if (error instanceof Error && (error.message.includes('model') || error.message.includes('404'))) {
        showToast('⚠️ Error de modelo. Intentando auto-reparación...');
        refreshApiModel();
      } else {
        alert('Hubo un error al generar el texto con IA. Por favor, inténtelo de nuevo.');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const refreshApiModel = async () => {
    setIsCheckingApi(true);
    const modelsToTry = [
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite-preview',
      'gemini-flash-latest'
    ];

    let found = false;
    for (const modelName of modelsToTry) {
      try {
        await ai.models.generateContent({
          model: modelName,
          contents: "ping",
          config: { maxOutputTokens: 1 }
        });
        setActiveModel(modelName);
        localStorage.setItem('sd_active_model', modelName);
        showToast(`✅ API Restaurada: Usando ${modelName}`);
        found = true;
        break;
      } catch (e) {
        console.warn(`Model ${modelName} failed, trying next...`);
      }
    }

    if (!found) {
      alert('No se ha podido encontrar una versión de la API compatible. Contacte con soporte técnico.');
    }
    setIsCheckingApi(false);
  };

  // --- HTML Generation ---

  const generateEmailHTML = () => {
    if (!client.name) {
      alert('Por favor, introduzca el nombre del cliente.');
      return '';
    }

    const t = TRANSLATIONS[client.language];
    const nextMonthIdx = (new Date().getMonth() + 1) % 12;
    const monthsEs = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const nextMonth = client.language === 'es' ? monthsEs[nextMonthIdx] : monthsEn[nextMonthIdx];

    const salutation = client.language === 'es' 
      ? (client.treatment === 'Sra.' ? 'Estimada' : 'Estimado') 
      : 'Dear';

    const introText = customIntro || (managementType === '1110' ? t.intro1110 : t.intro1105);

    let locationsHTML = '';
    locations.forEach((loc, i) => {
      let locContent = '';

      // Fees
      if (loc.enableTemp || loc.enablePerm) {
        let feeRows = '';
        if (loc.enableTemp) {
          const tempTxt = client.language === 'es'
            ? `Cuota temporal (primeros ${loc.tempMonths} meses, desde ${nextMonth})`
            : `Temporary fee (first ${loc.tempMonths} months, from ${nextMonth})`;
          feeRows += `
            <div style="color:#E30613;font-size:24px;font-weight:800;">${parseFloat(loc.temp || '0').toFixed(2)} € + ${loc.tax}</div>
            <div style="font-size:12px;color:#888;margin-bottom:10px;">${tempTxt}</div>
          `;
        }
        if (loc.enablePerm) {
          const permSuf = client.language === 'es'
            ? `(Dcto. Permanente sin límite de tiempo, desde ${nextMonth})`
            : `(Permanent discount, from ${nextMonth})`;
          feeRows += `
            <div style="color:#333;font-size:16px;font-weight:700;">${parseFloat(loc.perm || '0').toFixed(2)} € + ${loc.tax}</div>
            <div style="font-size:12px;color:#888;">${t.permFee} ${permSuf}</div>
          `;
        }
        locContent += `
          <div style="background:#fff;border-radius:20px;padding:20px;margin-bottom:15px;border:1px solid #eee;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            <table width="100%"><tr>
              <td width="50" valign="top"><img src="https://cdn-icons-png.flaticon.com/512/126/126252.png" width="35"></td>
              <td>${feeRows}</td>
            </tr></table>
          </div>
        `;
      }

      // Update
      if (loc.enableActualiza) {
        locContent += `
          <div style="background:#fff;border-radius:20px;padding:20px;margin-bottom:15px;border:1px solid #eee;">
            <table width="100%"><tr>
              <td width="50" valign="top"><img src="https://cdn-icons-png.flaticon.com/512/93/93158.png" width="35"></td>
              <td>
                <div style="color:#333;font-size:14px;font-weight:700;">${t.update}</div>
                <div style="font-size:12px;color:#666;">${t.updateDesc}</div>
              </td>
            </tr></table>
          </div>
        `;
      }

      // Devices
      if (loc.enableAmpli) {
        let devList = '';
        // Standard devices
        if (loc.devices && Object.keys(loc.devices).length > 0) {
          Object.entries(loc.devices).forEach(([id, qty]) => {
            const quantity = qty as number;
            if (quantity > 0) devList += `<li>${quantity} ${DEVICE_NAMES[id as keyof DeviceQuantities]}</li>`;
          });
        }
        // Extra devices/services
        if (loc.extraDevices && loc.extraDevices.length > 0) {
          loc.extraDevices.forEach(extra => {
            devList += `<li>${extra}</li>`;
          });
        }

        if (devList) {
          locContent += `
            <div style="background:#fff;border-radius:20px;padding:20px;margin-bottom:15px;border:1px solid #eee;">
              <table width="100%"><tr>
                <td width="50" valign="top"><img src="https://cdn-icons-png.flaticon.com/512/1828/1828817.png" width="35"></td>
                <td>
                  <div style="color:#333;font-size:14px;font-weight:700;">${t.equip}</div>
                  <ul style="font-size:12px;color:#666;padding-left:20px;margin:5px 0 0 0;">${devList}</ul>
                </td>
              </tr></table>
            </div>
          `;
        }
      }

      // Extras 1105
      if (managementType === '1105') {
        if (loc.enableTraslado) {
          locContent += `
            <div style="background:#fff;border-radius:20px;padding:20px;margin-bottom:15px;border:1px solid #eee;">
              <table width="100%"><tr>
                <td width="50" valign="top"><img src="https://cdn-icons-png.flaticon.com/512/619/619153.png" width="35"></td>
                <td><div style="color:#333;font-size:14px;font-weight:700;">${t.transfer}</div><div style="font-size:12px;color:#666;">${t.transferDesc}</div></td>
              </tr></table>
            </div>
          `;
        }
        if (loc.enableANP) {
          locContent += `
            <div style="background:#fff;border-radius:20px;padding:20px;margin-bottom:15px;border:1px solid #eee;">
              <table width="100%"><tr>
                <td width="50" valign="top"><img src="https://cdn-icons-png.flaticon.com/512/3126/3126647.png" width="35"></td>
                <td><div style="color:#333;font-size:14px;font-weight:700;">${t.anp}</div><div style="font-size:12px;color:#666;">${t.anpDesc}</div></td>
              </tr></table>
            </div>
          `;
        }
        if (loc.gift) {
          locContent += `
            <div style="background:#fff;border-radius:20px;padding:20px;margin-bottom:15px;border:1px solid #eee;">
              <table width="100%"><tr>
                <td width="50" valign="top"><img src="https://cdn-icons-png.flaticon.com/512/2611/2611158.png" width="35"></td>
                <td>
                  <div style="color:#333;font-size:14px;font-weight:700;">${t.gift}</div>
                  <div style="font-size:18px;color:#E30613;font-weight:800;">${loc.gift} €</div>
                  <div style="font-size:12px;color:#666;">${t.giftDesc}</div>
                </td>
              </tr></table>
            </div>
          `;
        }
      }

      // Extras 1110
      if (managementType === '1110' && loc.enableAsume) {
        locContent += `
          <div style="background:#fff5f5;border-radius:20px;padding:20px;margin-bottom:15px;border:1px solid #ffebeb;">
            <table width="100%"><tr>
              <td width="50" valign="top"><img src="https://cdn-icons-png.flaticon.com/512/1161/1161388.png" width="35"></td>
              <td>
                <div style="color:#E30613;font-size:14px;font-weight:800;margin-bottom:5px;">${t.asume}</div>
                <div style="font-size:12px;color:#444;line-height:1.6;">${t.asumeDesc}</div>
              </td>
            </tr></table>
          </div>
        `;
      }

      if (locContent.trim()) {
        locationsHTML += `
          <div style="margin-bottom:30px;border-left:4px solid #E30613;padding-left:15px;">
            <p style="font-weight:bold;margin-bottom:10px;color:#555;">📍 ${loc.address || 'Ubicación ' + (i + 1)}</p>
            ${locContent}
          </div>
        `;
      }
    });

    return `
      <div style="font-family:Arial,sans-serif;padding:10px;max-width:600px;margin:auto;background:#f4f7f9;">
        <table width="100%" style="background:#fff;border-radius:25px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,0.05);border:3px solid #E30613;">
          <tr><td align="center" style="padding:25px;">
            <img src="https://www.verisure.es/sites/es/themes/custom/sd_es/logo.png" width="160" referrerPolicy="no-referrer">
          </td></tr>
          <tr><td>
            <img src="https://www.verisure.es/sites/es/files/flmngr/BODEGONES/bodegon_flechas_premio.png" width="600" style="width:100%;display:block;" referrerPolicy="no-referrer">
          </td></tr>
          <tr><td style="padding:30px;">
            <h2 style="color:#E30613;font-size:20px;margin-bottom:15px;">${salutation} ${client.treatment} ${client.name}</h2>
            <div style="color:#333;font-size:14px;line-height:1.7;margin-bottom:25px;">
              ${introText}
            </div>
            ${locationsHTML}
            <div style="margin-top:30px;padding-top:20px;border-top:1px solid #eee;text-align:center;">
              <p style="font-size:11px;color:#999;">${t.footer}</p>
            </div>
            <div style="background-color:#fff5f5;border:1px solid #E30613;border-radius:10px;padding:15px;margin-top:25px;text-align:center;">
              <div style="font-size:20px;margin-bottom:5px;">🛡️</div>
              <strong style="color:#E30613;font-size:12px;text-transform:uppercase;">${t.disclaimerHeader}</strong><br>
              <span style="font-size:11px;color:#555;display:block;margin-top:5px;">${t.disclaimer}</span>
            </div>
          </td></tr>
        </table>
      </div>
    `;
  };

  const generateLegalHTML = () => {
    const sk = "border:1px solid #ccc;padding:8px;background:#f8f9fa;width:40%;font-size:11px;color:#666;";
    const sv = "border:1px solid #ccc;padding:8px;background:#fff;font-weight:bold;font-size:12px;color:#000;";
    const sp = "height:10px;border:none;";

    return `
      <table style="width:100%;border-collapse:collapse;font-family:Arial;color:black;">
        <tr><td style="${sk}">N.º CLIENTE</td><td style="${sv}">${legal.clientNum}</td></tr>
        <tr><td style="${sk}">MATRÍCULA GESTOR</td><td style="${sv}">${legal.matricula}</td></tr>
        <tr><td colspan="2" style="${sp}"></td></tr>
        <tr><td style="${sk}">Nombre titular Verisure</td><td style="${sv}">${legal.titularSD}</td></tr>
        <tr><td style="${sk}">DNI/CIF</td><td style="${sv}">${legal.dniSD}</td></tr>
        <tr><td style="${sk}">Dirección contrato</td><td style="${sv}">${legal.dirSD}</td></tr>
        <tr><td style="${sk}">Mail envío</td><td style="${sv}">${legal.email}</td></tr>
        <tr><td colspan="2" style="${sp}"></td></tr>
        <tr><td style="${sk}">Compañía competencia</td><td style="${sv}">${legal.company}</td></tr>
        <tr><td style="${sk}">Titular competencia</td><td style="${sv}">${legal.titularComp}</td></tr>
        <tr><td style="${sk}">DNI/CIF competencia</td><td style="${sv}">${legal.dniComp}</td></tr>
        <tr><td style="${sk}">Dirección competencia</td><td style="${sv}">${legal.dirComp}</td></tr>
        <tr><td style="${sk}">Fecha instalación</td><td style="${sv}">${legal.installDate}</td></tr>
        <tr><td colspan="2" style="${sp}"></td></tr>
        <tr><td style="${sk}">¿CARTA PROMO?</td><td style="${sv}">${legal.cartaPromo}</td></tr>
        <tr><td style="${sk}">N.º aviso baja</td><td style="${sv}">${legal.avisoBaja}</td></tr>
        <tr><td colspan="2" style="${sp}"></td></tr>
        <tr><td style="${sk}">Observaciones</td><td style="${sv}">${legal.obs}</td></tr>
      </table>
    `;
  };

  const copyToClipboard = async (type: 'email' | 'legal') => {
    const html = type === 'email' ? generateEmailHTML() : generateLegalHTML();
    if (!html) return;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }) })
      ]);
      showToast(`✅ ${type === 'email' ? 'Propuesta' : 'Ficha'} copiada al portapapeles`);
      setShowPreview(false);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      alert('Error al copiar. Por favor, use Chrome.');
    }
  };

  // --- Render Helpers ---

  const currentLoc = locations[currentLocIndex];
  const hasAsume = managementType === '1110' && locations.some(l => l.enableAsume);

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-gray-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#E30613] to-[#a00410] text-white py-6 px-4 shadow-lg relative overflow-hidden">
        {/* Config Gear */}
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
          title="Configuración de API"
        >
          <Settings className={cn("w-5 h-5", showConfig && "animate-spin")} />
        </button>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="flex items-center gap-6">
            <img 
              src="https://www.verisure.es/sites/es/themes/custom/sd_es/logo.png" 
              alt="Verisure" 
              className="h-12 w-auto drop-shadow-md"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-2xl font-extrabold tracking-wider uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
              Gestor de Propuestas
            </h1>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto mt-6 flex justify-center">
          <div className="flex bg-black/20 p-1 rounded-xl backdrop-blur-sm border border-white/10">
            <button 
              onClick={() => setActiveTab('client')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'client' ? "bg-white text-red-600 shadow-md" : "text-white/70 hover:text-white"
              )}
            >
              <Briefcase className="w-4 h-4" />
              GESTOR
            </button>
            {hasAsume && (
              <button 
                onClick={() => setActiveTab('legal')}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                  activeTab === 'legal' ? "bg-white text-red-600 shadow-md" : "text-white/70 hover:text-white"
                )}
              >
                <FileText className="w-4 h-4" />
                LEGAL
              </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showConfig && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto mt-4 px-4"
          >
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-red-50 p-3 rounded-xl">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-gray-800">Estado de la Conexión IA</h3>
                  <p className="text-xs text-gray-500">Si el asistente no responde, verifique su conexión o reinicie la aplicación.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={refreshApiModel}
                  disabled={isCheckingApi}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isCheckingApi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  AUTO-DETECTAR API
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  REINICIAR APP
                </button>
                <button 
                  onClick={() => setShowConfig(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
                >
                  CERRAR
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'client' ? (
            <motion.div 
              key="client-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Management Type Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setManagementType('1110')}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left transition-all group",
                    managementType === '1110' 
                      ? "border-red-500 bg-red-50 ring-4 ring-red-500/10" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={cn("text-lg font-black", managementType === '1110' ? "text-red-600" : "text-gray-700")}>CLIENTE 1110</h3>
                    <div className={cn("p-2 rounded-full", managementType === '1110' ? "bg-red-600 text-white" : "bg-gray-100 text-gray-400")}>
                      <RotateCcw className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Rescate por cambio de compañía de seguridad.</p>
                </button>

                <button 
                  onClick={() => setManagementType('1105')}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left transition-all group",
                    managementType === '1105' 
                      ? "border-red-500 bg-red-50 ring-4 ring-red-500/10" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={cn("text-lg font-black", managementType === '1105' ? "text-red-600" : "text-gray-700")}>CLIENTE 1105</h3>
                    <div className={cn("p-2 rounded-full", managementType === '1105' ? "bg-red-600 text-white" : "bg-gray-100 text-gray-400")}>
                      <Truck className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Traslados, cambios administrativos o fidelización.</p>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Client Info */}
                <div className="lg:col-span-5 space-y-6">
                  <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                      <User className="w-5 h-5 text-red-600" />
                      <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">Datos del Cliente</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <Select 
                          label="Trat."
                          value={client.treatment}
                          onChange={(v: string) => setClient({ ...client, treatment: v })}
                          options={[
                            { value: 'Sr.', label: 'Sr.' },
                            { value: 'Sra.', label: 'Sra.' }
                          ]}
                        />
                        <Input 
                          label="Nombre y Apellidos"
                          className="col-span-2"
                          value={client.name}
                          onChange={(v: string) => setClient({ ...client, name: v })}
                          placeholder="Juan García..."
                        />
                      </div>
                      <Input 
                        label="DNI / CIF"
                        value={client.dni}
                        onChange={(v: string) => setClient({ ...client, dni: v })}
                        placeholder="12345678A"
                      />
                      <Select 
                        label="Idioma Propuesta"
                        value={client.language}
                        onChange={(v: Language) => setClient({ ...client, language: v })}
                        options={[
                          { value: 'es', label: '🇪🇸 Español' },
                          { value: 'en', label: '🇬🇧 English' }
                        ]}
                      />
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gestión Multi-Sede</h3>
                        <div className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded">
                          {locations.length} {locations.length === 1 ? 'SEDE' : 'SEDES'}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {locations.map((loc, i) => (
                          <button
                            key={loc.id}
                            onClick={() => setCurrentLocIndex(i)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-2",
                              currentLocIndex === i 
                                ? "bg-red-600 border-red-600 text-white shadow-md" 
                                : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"
                            )}
                          >
                            <MapPin className="w-3 h-3" />
                            {loc.address ? (loc.address.length > 10 ? loc.address.substring(0, 10) + '...' : loc.address) : `Sede ${i + 1}`}
                            {locations.length > 1 && (
                              <span 
                                onClick={(e) => { e.stopPropagation(); removeLocation(i); }}
                                className="ml-1 hover:text-red-200 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </span>
                            )}
                          </button>
                        ))}
                        <button 
                          onClick={addLocation}
                          className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* AI Agent Section */}
                    <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-600" />
                          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-900">Asistente IA de Redacción</h3>
                        </div>
                        {customIntro && (
                          <button 
                            onClick={() => { setCustomIntro(null); setAiSituation(''); }}
                            className="text-[10px] font-bold text-indigo-600 hover:underline"
                          >
                            Restablecer
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-[9px] text-amber-800 leading-tight">
                            <b>SEGURIDAD:</b> No introduzca nombres, DNI o direcciones. Solo describa el contexto de la situación.
                          </p>
                        </div>
                        <textarea 
                          value={aiSituation}
                          onChange={(e) => setAiSituation(e.target.value)}
                          placeholder="Describe el contexto (ej: fallecimiento, mudanza, problemas económicos...)"
                          className="w-full px-3 py-2 bg-white/80 border-2 border-transparent rounded-xl text-xs transition-all focus:outline-none focus:border-indigo-500 min-h-[80px] placeholder:text-indigo-300"
                        />
                        <button 
                          onClick={generateAIText}
                          disabled={isGeneratingAI || !aiSituation.trim()}
                          className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                        >
                          {isGeneratingAI ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generando texto empático...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Personalizar Introducción con IA
                            </>
                          )}
                        </button>
                      </div>

                      {customIntro && (
                        <div className="mt-4 p-3 bg-white/60 rounded-lg border border-indigo-100/50">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Vista previa del texto IA:</p>
                          <p className="text-[11px] text-indigo-900 italic leading-relaxed">"{customIntro}"</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Right Column: Location Config */}
                <div className="lg:col-span-7 space-y-6">
                  <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-red-600" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">Configuración de Sede</h2>
                      </div>
                      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        {(['IVA', 'IGIC', 'IPSI'] as TaxType[]).map(t => (
                          <button
                            key={t}
                            onClick={() => updateLocation(currentLocIndex, { tax: t })}
                            className={cn(
                              "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                              currentLoc.tax === t ? "bg-white text-red-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Input 
                        label="Dirección Instalación"
                        value={currentLoc.address}
                        onChange={(v: string) => updateLocation(currentLocIndex, { address: v })}
                        placeholder="Calle Principal 123..."
                        prefix={<MapPin className="w-4 h-4" />}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Switch 
                            label={`Cuota Temporal (SIN ${currentLoc.tax})`}
                            checked={currentLoc.enableTemp}
                            onChange={(v) => updateLocation(currentLocIndex, { enableTemp: v })}
                          />
                          {currentLoc.enableTemp && (
                            <div className="flex gap-2 pl-4">
                              <Select 
                                className="w-1/2"
                                value={currentLoc.tempMonths}
                                onChange={(v: string) => updateLocation(currentLocIndex, { tempMonths: v })}
                                options={[
                                  { value: '3', label: '3 Meses' },
                                  { value: '6', label: '6 Meses' },
                                  { value: '9', label: '9 Meses' },
                                  { value: '12', label: '12 Meses' }
                                ]}
                              />
                              <Input 
                                className="w-1/2"
                                type="number"
                                value={currentLoc.temp}
                                onChange={(v: string) => updateLocation(currentLocIndex, { temp: v })}
                                suffix="€"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Switch 
                            label={`Cuota Perm. (SIN ${currentLoc.tax})`}
                            checked={currentLoc.enablePerm}
                            onChange={(v) => updateLocation(currentLocIndex, { enablePerm: v })}
                          />
                          {currentLoc.enablePerm && (
                            <div className="pl-4">
                              <Input 
                                type="number"
                                value={currentLoc.perm}
                                onChange={(v: string) => updateLocation(currentLocIndex, { perm: v })}
                                suffix="€"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Switch 
                          label="Actualización Sistema"
                          checked={currentLoc.enableActualiza}
                          onChange={(v) => updateLocation(currentLocIndex, { enableActualiza: v })}
                        />
                      </div>

                      {managementType === '1110' && (
                        <Switch 
                          label="Asumimos la Permanencia"
                          checked={currentLoc.enableAsume}
                          onChange={(v) => updateLocation(currentLocIndex, { enableAsume: v })}
                        />
                      )}

                      {managementType === '1105' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Switch 
                              label="Traslado sin coste"
                              checked={currentLoc.enableTraslado}
                              onChange={(v) => updateLocation(currentLocIndex, { enableTraslado: v })}
                            />
                            <Switch 
                              label="ANP sin coste"
                              checked={currentLoc.enableANP}
                              onChange={(v) => updateLocation(currentLocIndex, { enableANP: v })}
                            />
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Tarjetas Regalo</h3>
                            <div className="flex gap-4">
                              {(['100', '120'] as const).map(amount => (
                                <button
                                  key={amount}
                                  onClick={() => updateLocation(currentLocIndex, { gift: currentLoc.gift === amount ? null : amount })}
                                  className={cn(
                                    "flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2",
                                    currentLoc.gift === amount 
                                      ? "bg-red-600 border-red-600 text-white shadow-md" 
                                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                  )}
                                >
                                  <CreditCard className="w-4 h-4" />
                                  {amount}€
                                </button>
                              ))}
                            </div>
                            {currentLoc.gift && (
                              <div className="mt-4 grid grid-cols-2 gap-2">
                                <button 
                                  onClick={() => window.open(`https://form.jotform.com/Verisure/formulario_recomendar_${currentLoc.gift === '100' ? 'bj' : '120_bj'}_gestor`, '_blank')}
                                  className="py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase hover:bg-gray-50 transition-colors"
                                >
                                  📝 GESTOR
                                </button>
                                <button 
                                  onClick={() => window.open(`https://form.jotform.com/Verisure/retencion-recomendado-baja${currentLoc.gift === '120' ? '-plus' : ''}`, '_blank')}
                                  className="py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase hover:bg-gray-50 transition-colors"
                                >
                                  👤 CLIENTE
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Device Grid */}
                  <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-red-600" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">Dispositivos Incluidos</h2>
                      </div>
                      <Switch 
                        label="Habilitar Ampliación"
                        checked={currentLoc.enableAmpli}
                        onChange={(v) => updateLocation(currentLocIndex, { enableAmpli: v })}
                      />
                    </div>

                    <AnimatePresence>
                      {currentLoc.enableAmpli && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-3"
                        >
                          {(Object.keys(DEVICE_NAMES) as (keyof DeviceQuantities)[]).map(id => {
                            const qty = currentLoc.devices[id] || 0;
                            return (
                              <div 
                                key={id}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                                  qty > 0 ? "border-red-500 bg-red-50/30" : "border-gray-100 bg-gray-50/50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div 
                                    onClick={() => toggleDevice(currentLocIndex, id)}
                                    className={cn(
                                      "w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors",
                                      qty > 0 ? "bg-red-600 border-red-600 text-white" : "bg-white border-gray-300"
                                    )}
                                  >
                                    {qty > 0 && <CheckCircle2 className="w-3 h-3" />}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={cn("text-gray-400", qty > 0 && "text-red-600")}>{DEVICE_ICONS[id]}</span>
                                    <span className={cn("text-xs font-bold", qty > 0 ? "text-gray-900" : "text-gray-500")}>{DEVICE_NAMES[id]}</span>
                                  </div>
                                </div>
                                
                                {qty > 0 && (
                                  <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-red-100">
                                    <button onClick={() => updateDeviceQty(currentLocIndex, id, -1)} className="text-red-600 font-black hover:scale-125 transition-transform">-</button>
                                    <span className="text-xs font-black w-4 text-center">{qty}</span>
                                    <button onClick={() => updateDeviceQty(currentLocIndex, id, 1)} className="text-red-600 font-black hover:scale-125 transition-transform">+</button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {/* Extra devices from AI */}
                          {currentLoc.extraDevices && currentLoc.extraDevices.map((extra, idx) => (
                            <div 
                              key={`extra-${idx}`}
                              className="flex items-center justify-between p-3 rounded-xl border-2 border-indigo-500 bg-indigo-50/30"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-indigo-600" />
                                  <span className="text-xs font-bold text-gray-900">{extra}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  const newExtras = currentLoc.extraDevices.filter((_, i) => i !== idx);
                                  updateLocation(currentLocIndex, { extraDevices: newExtras });
                                }}
                                className="text-indigo-600 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-gray-200">
                <button 
                  onClick={resetForm}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar Todo
                </button>
                <button 
                  onClick={() => setShowPreview(true)}
                  className="flex-1 py-4 bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Eye className="w-4 h-4" />
                  Vista Previa
                </button>
                <button 
                  onClick={() => copyToClipboard('email')}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-600/20"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Propuesta Email
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="legal-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">Datos Verisure</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="N.º Cliente" value={legal.clientNum} onChange={(v: string) => setLegal({ ...legal, clientNum: v })} />
                    <Input label="Matrícula Gestor" value={legal.matricula} onChange={(v: string) => setLegal({ ...legal, matricula: v })} />
                  </div>
                  <Input label="Titular Verisure" value={legal.titularSD} onChange={(v: string) => setLegal({ ...legal, titularSD: v })} />
                  <Input label="DNI/CIF" value={legal.dniSD} onChange={(v: string) => setLegal({ ...legal, dniSD: v })} />
                  <Input label="Dirección Contrato" value={legal.dirSD} onChange={(v: string) => setLegal({ ...legal, dirSD: v })} />
                  <Input label="Email Envío Documentación" type="email" value={legal.email} onChange={(v: string) => setLegal({ ...legal, email: v })} />
                </section>

                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-red-600" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">Datos Compañía Competencia</h2>
                  </div>

                  <Input label="Compañía" value={legal.company} onChange={(v: string) => setLegal({ ...legal, company: v })} />
                  
                  <div className="space-y-4">
                    <Switch 
                      label="¿Titular diferente?" 
                      checked={legal.diffTitular} 
                      onChange={(v) => setLegal({ ...legal, diffTitular: v })} 
                    />
                    {legal.diffTitular && (
                      <div className="grid grid-cols-1 gap-3 pl-4 animate-in fade-in slide-in-from-top-2">
                        <Input placeholder="Nombre titular competencia" value={legal.titularComp} onChange={(v: string) => setLegal({ ...legal, titularComp: v })} />
                        <Input placeholder="DNI/CIF competencia" value={legal.dniComp} onChange={(v: string) => setLegal({ ...legal, dniComp: v })} />
                      </div>
                    )}

                    <Switch 
                      label="¿Dirección diferente?" 
                      checked={legal.diffDir} 
                      onChange={(v) => setLegal({ ...legal, diffDir: v })} 
                    />
                    {legal.diffDir && (
                      <div className="pl-4 animate-in fade-in slide-in-from-top-2">
                        <Input placeholder="Dirección competencia" value={legal.dirComp} onChange={(v: string) => setLegal({ ...legal, dirComp: v })} />
                      </div>
                    )}
                  </div>

                  <Input label="Fecha Instalación" type="date" value={legal.installDate} onChange={(v: string) => setLegal({ ...legal, installDate: v })} />
                </section>
              </div>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">Documentación y Notas</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select 
                    label="¿CARTA PROMO?" 
                    value={legal.cartaPromo} 
                    onChange={(v: string) => setLegal({ ...legal, cartaPromo: v })}
                    options={[{ value: 'SI', label: 'SI' }, { value: 'NO', label: 'NO' }]}
                  />
                  <Input label="N.º aviso de baja" value={legal.avisoBaja} onChange={(v: string) => setLegal({ ...legal, avisoBaja: v })} />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Observaciones</label>
                  <textarea 
                    value={legal.obs}
                    onChange={(e) => setLegal({ ...legal, obs: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border-2 border-transparent rounded-lg text-sm transition-all focus:outline-none focus:border-red-500 focus:bg-white min-h-[100px]"
                  />
                </div>
              </section>

              <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-gray-200">
                <button 
                  onClick={resetForm}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar Todo
                </button>
                <button 
                  onClick={() => setShowPreview(true)}
                  className="flex-1 py-4 bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Eye className="w-4 h-4" />
                  Vista Previa
                </button>
                <button 
                  onClick={() => copyToClipboard('legal')}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-600/20"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Formulario Sal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-12 text-center border-t border-gray-200">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
          Powered by <span className="text-gray-600">ROMMER VOLCANES</span>
        </p>
      </footer>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Vista Previa</h3>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div 
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: activeTab === 'client' ? generateEmailHTML() : generateLegalHTML() }}
                />
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => copyToClipboard(activeTab === 'client' ? 'email' : 'legal')}
                  className="px-8 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Contenido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
