import React, { useState, useEffect, useMemo } from 'react';
import GPSCard from '../components/GPSTracking';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut, Plus, Search, Truck, Users, Calendar,
  Settings, LayoutGrid, Wrench, Shield, Check, Info, AlertTriangle,
  Play, Sparkles, MapPin, Gauge, Fuel, Thermometer, ArrowRight, ArrowLeft, X, UserPlus,
  TrendingUp, CircleDollarSign, Download, Upload, FileText, Menu, Trash2
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import logo from '../assets/favicon.png';

const getDocStatus = (expiryDateStr) => {
  if (!expiryDateStr) return { label: 'Pending Date', color: 'text-clay-muted bg-clay-canvas' };
  const today = new Date();
  const exp = new Date(expiryDateStr);
  if (isNaN(exp.getTime())) return { label: 'Invalid Date', color: 'text-red-500 bg-red-100' };

  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'Expired', color: 'text-red-600 bg-red-100 font-extrabold animate-pulse' };
  } else if (diffDays <= 30) {
    return { label: 'Expiring Soon', color: 'text-amber-600 bg-amber-100 font-extrabold' };
  } else {
    return { label: 'Valid', color: 'text-emerald-600 bg-emerald-100 font-extrabold' };
  }
};

// Stub: replace with real ImageKit integration when ready
const uploadToImageKit = async (file, fileName) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result); // returns base64 data URL as placeholder
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};


export default function Console() {
  const { user, token, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [activeMenu, setActiveMenu] = useState('overview');
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [reports, setReports] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [imagekitAuth, setImagekitAuth] = useState(null);
  const [docUploading, setDocUploading] = useState({});

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTypeVeh, setFilterTypeVeh] = useState('all');

  // Selected details panel
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeVehicleProfileId, setActiveVehicleProfileId] = useState(null);
  const [vehicleDossierTab, setVehicleDossierTab] = useState('documents');

  // Modals state
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [isEditVehicleMode, setIsEditVehicleMode] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState(null);
  const [showDispatchTrip, setShowDispatchTrip] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Form states - Vehicle (Core)
  const [vReg, setVReg] = useState('');
  const [vName, setVName] = useState('');
  const [vType, setVType] = useState('Truck');
  const [vMaxLoad, setVMaxLoad] = useState('');
  const [vOdometer, setVOdometer] = useState('');
  const [vCost, setVCost] = useState('');

  // Collaborator Added Fields - Vehicle (Form states)
  const [newNickname, setNewNickname] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newMfgYear, setNewMfgYear] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newVin, setNewVin] = useState('');
  const [newEngineNum, setNewEngineNum] = useState('');
  const [newRegState, setNewRegState] = useState('');
  const [newRegDate, setNewRegDate] = useState('');

  const [newSeatingCapacity, setNewSeatingCapacity] = useState('');
  const [newCargoCapacity, setNewCargoCapacity] = useState('');
  const [newMaxGrossWeight, setNewMaxGrossWeight] = useState('');
  const [newFuelTankCapacity, setNewFuelTankCapacity] = useState('');

  const [newOwnerName, setNewOwnerName] = useState('');
  const [newPurchaseDate, setNewPurchaseDate] = useState('');
  const [newPurchaseCost, setNewPurchaseCost] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [newWarrantyExpiry, setNewWarrantyExpiry] = useState('');
  const [newLeaseType, setNewLeaseType] = useState('Owned');

  // New Indian System / Status & Fuel fields
  const [newAssignedDriver, setNewAssignedDriver] = useState('');
  const [newDepotLocation, setNewDepotLocation] = useState('');
  const [newFuelType, setNewFuelType] = useState('Diesel');
  const [newFuelCardNumber, setNewFuelCardNumber] = useState('');
  const [newMileage, setNewMileage] = useState('');
  const [newAvgMonthlyFuelConsumption, setNewAvgMonthlyFuelConsumption] = useState('');
  const [newVehicleStatus, setNewVehicleStatus] = useState('available');

  // Insurance Information states
  const [insCompany, setInsCompany] = useState('');
  const [insPolicyNumber, setInsPolicyNumber] = useState('');
  const [insCoverageAmount, setInsCoverageAmount] = useState('');
  const [insStartDate, setInsStartDate] = useState('');
  const [insExpiryDate, setInsExpiryDate] = useState('');
  const [insReminderDays, setInsReminderDays] = useState('30');

  // Vehicle Documents states
  const [showDocSection, setShowDocSection] = useState(false);
  const [rcFile, setRcFile] = useState('');
  const [rcIssue, setRcIssue] = useState('');
  const [rcExpiry, setRcExpiry] = useState('');

  const [insFile, setInsFile] = useState('');
  const [insIssue, setInsIssue] = useState('');
  const [insExpiry, setInsExpiry] = useState('');

  const [polFile, setPolFile] = useState('');
  const [polIssue, setPolIssue] = useState('');
  const [polExpiry, setPolExpiry] = useState('');

  const [fitFile, setFitFile] = useState('');
  const [fitIssue, setFitIssue] = useState('');
  const [fitExpiry, setFitExpiry] = useState('');

  const [perFile, setPerFile] = useState('');
  const [perIssue, setPerIssue] = useState('');
  const [perExpiry, setPerExpiry] = useState('');

  const [taxFile, setTaxFile] = useState('');
  const [taxIssue, setTaxIssue] = useState('');
  const [taxExpiry, setTaxExpiry] = useState('');

  // Form states - Driver
  const [dName, setDName] = useState('');
  const [dLicense, setDLicense] = useState('');
  const [dCategory, setDCategory] = useState('Class A');
  const [dExpiry, setDExpiry] = useState('');
  const [dContact, setDContact] = useState('');
  const [dEmail, setDEmail] = useState('');
  const [dScore, setDScore] = useState(100);
  const [dStatus, setDStatus] = useState('available');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showEditDriver, setShowEditDriver] = useState(false);
  const [dAadhaar, setDAadhaar] = useState('');
  const [dPan, setDPan] = useState('');
  const [dBloodGroup, setDBloodGroup] = useState('O+');
  const [dAddress, setDAddress] = useState('');
  const [activeDriverProfileId, setActiveDriverProfileId] = useState(null);
  const [dossierTab, setDossierTab] = useState('documents');
  const [dAvatar, setDAvatar] = useState('');
  const [dAadhaarFile, setDAadhaarFile] = useState('');
  const [dPanFile, setDPanFile] = useState('');
  const [dDlFile, setDDlFile] = useState('');
  const [uploading, setUploading] = useState(false);

  // Form states - Trip Dispatch
  const [tSource, setTSource] = useState('');
  const [tDest, setTDest] = useState('');
  const [tVehicleId, setTVehicleId] = useState('');
  const [tDriverId, setTDriverId] = useState('');
  const [tWeight, setTWeight] = useState('');
  const [tDistance, setTDistance] = useState('');
  const [tActualDistance, setTActualDistance] = useState('');
  const [tStatus, setTStatus] = useState('draft');
  const [tRevenue, setTRevenue] = useState('');
  const [tDriverSalary, setTDriverSalary] = useState('');
  const [tEstimatedFuelCost, setTEstimatedFuelCost] = useState('');
  const [tActualFuelCost, setTActualFuelCost] = useState('');
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [editingTripId, setEditingTripId] = useState('');
  
  // Trip complete modal inputs
  const [completeTripId, setCompleteTripId] = useState('');
  const [cActualDistance, setCActualDistance] = useState('');
  const [cRevenue, setCRevenue] = useState('');
  const [cDriverSalary, setCDriverSalary] = useState('');
  const [cActualFuelCost, setCActualFuelCost] = useState('');
  const [showCompleteTrip, setShowCompleteTrip] = useState(false);

  // Form states - Maintenance
  const [mVehicleId, setMVehicleId] = useState('');
  const [mIssue, setMIssue] = useState('');
  const [mCost, setMCost] = useState('');

  // Form states - Expense and Fuel
  const [eVehicleId, setEVehicleId] = useState('');
  const [eType, setEType] = useState('toll');
  const [eAmount, setEAmount] = useState('');
  const [eLiters, setELiters] = useState('');
  const [eOdometer, setEOdometer] = useState('');
  const [eDate, setEDate] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState('');

  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelOdometer, setFuelOdometer] = useState('');
  const [fuelDate, setFuelDate] = useState('');
  const [showAddFuel, setShowAddFuel] = useState(false);
  const [showEditFuel, setShowEditFuel] = useState(false);
  const [editingFuelId, setEditingFuelId] = useState('');

  // Copilot Chat state
  const [copilotMessages, setCopilotMessages] = useState([
    { role: 'assistant', content: "Hello! I am your AI Fleet Copilot. I can help recommend drivers, select vehicles for dispatch, predict maintenance schedules, or compile operational cost reports. Ask me anything!" }
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Settings states
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('+91 98765 43210');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [orgName, setOrgName] = useState('WinNova Logistics');
  const [orgLogo, setOrgLogo] = useState('');
  const [orgTimezone, setOrgTimezone] = useState('IST (UTC+05:30)');
  const [prefTheme, setPrefTheme] = useState('light');
  const [prefNotifications, setPrefNotifications] = useState(true);

  // Report filtering states
  const [reportType, setReportType] = useState('fleet');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportVehicleId, setReportVehicleId] = useState('');
  const [reportDriverId, setReportDriverId] = useState('');
  const [reportStatus, setReportStatus] = useState('');

  // Notifications Drawer
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);

  // Safety Banner Alert
  const [safetyAlert, setSafetyAlert] = useState(null);

  // Notifications Logs state
  const [logs, setLogs] = useState([
    { type: 'info', text: 'Driver Preeti Patel assigned to truck Tata Ultra Delivery.', time: '5m ago' },
    { type: 'warning', text: 'Diagnostic alert: TR-104 engine temp elevated.', time: '1h ago' },
    { type: 'success', text: 'Trip TR-2026-904 completed successfully.', time: '3h ago' }
  ]);

  // Fetch all operations data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resVeh, resDrv, resTrp, resMnt, resExp, resRep] = await Promise.all([
        fetch('/api/vehicles', { headers }),
        fetch('/api/drivers', { headers }),
        fetch('/api/trips', { headers }),
        fetch('/api/maintenance', { headers }),
        fetch('/api/expenses', { headers }),
        fetch('/api/reports/analytics', { headers })
      ]);

      const [dataVeh, dataDrv, dataTrp, dataMnt, dataExp, dataRep] = await Promise.all([
        resVeh.json(), resDrv.json(), resTrp.json(), resMnt.json(), resExp.json(), resRep.json()
      ]);

      if (dataVeh.success) setVehicles(dataVeh.data);
      if (dataDrv.success) setDrivers(dataDrv.data);
      if (dataTrp.success) setTrips(dataTrp.data);
      if (dataMnt.success) setMaintenance(dataMnt.data);
      if (dataExp.success) setExpenses(dataExp.data);
      if (dataRep.success) setReports(dataRep.data);

    } catch (err) {
      console.error('Error fetching ERP dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Upload a file to ImageKit and return the URL
  const uploadToImageKit = async (file, folder = 'vehicle-docs') => {
    // Dynamically fetch fresh auth parameters on every single upload to prevent token reuse errors
    const authRes = await fetch('/api/imagekit/auth', { headers: { 'Authorization': `Bearer ${token}` } });
    const authData = await authRes.json();
    if (!authData.success) {
      throw new Error(authData.message || 'Failed to authenticate with ImageKit backend');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('folder', folder);
    formData.append('publicKey', authData.publicKey);
    formData.append('signature', authData.signature);
    formData.append('expire', authData.expire);
    formData.append('token', authData.token);

    const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!data.url) throw new Error(data.message || 'Upload failed');
    return data.url;
  };


  // Reset and Edit Vehicle helpers
  const resetVehicleForm = () => {
    setVReg(''); setVName(''); setVMaxLoad(''); setVOdometer(''); setVCost('');
    setNewNickname(''); setNewBrand(''); setNewModel(''); setNewMfgYear(''); setNewColor('');
    setNewVin(''); setNewEngineNum(''); setNewRegState(''); setNewRegDate('');
    setNewSeatingCapacity(''); setNewCargoCapacity(''); setNewMaxGrossWeight(''); setNewFuelTankCapacity('');
    setNewOwnerName(''); setNewPurchaseDate(''); setNewPurchaseCost(''); setNewVendor('');
    setNewWarrantyExpiry(''); setNewLeaseType('Owned');

    setNewAssignedDriver(''); setNewDepotLocation(''); setNewFuelType('Diesel');
    setNewFuelCardNumber(''); setNewMileage(''); setNewAvgMonthlyFuelConsumption('');
    setNewVehicleStatus('available');

    setInsCompany(''); setInsPolicyNumber(''); setInsCoverageAmount(''); setInsStartDate(''); setInsExpiryDate(''); setInsReminderDays('30');
    setRcFile(''); setRcIssue(''); setRcExpiry('');
    setInsFile(''); setInsIssue(''); setInsExpiry('');
    setPolFile(''); setPolIssue(''); setPolExpiry('');
    setFitFile(''); setFitIssue(''); setFitExpiry('');
    setPerFile(''); setPerIssue(''); setPerExpiry('');
    setTaxFile(''); setTaxIssue(''); setTaxExpiry('');
    setShowDocSection(false);
    setIsEditVehicleMode(false);
    setEditVehicleId(null);
  };

  const startEditVehicle = (veh) => {
    setSubmitError('');
    setIsEditVehicleMode(true);
    setEditVehicleId(veh._id);
    
    setVReg(veh.reg || '');
    setVName(veh.name || '');
    setVType(veh.type || 'Truck');
    setVMaxLoad(veh.maxLoad !== undefined ? String(veh.maxLoad) : '');
    setVOdometer(veh.odometer !== undefined ? String(veh.odometer) : '');
    setVCost(veh.cost !== undefined ? String(veh.cost) : '');

    setNewNickname(veh.nickname || '');
    setNewBrand(veh.brand || '');
    setNewModel(veh.model || '');
    setNewMfgYear(veh.mfgYear || '');
    setNewColor(veh.color || '');
    setNewVin(veh.vin || '');
    setNewEngineNum(veh.engineNum || '');
    setNewRegState(veh.regState || '');
    setNewRegDate(veh.regDate || '');

    setNewSeatingCapacity(veh.seatingCapacity || '');
    setNewCargoCapacity(veh.cargoCapacity || '');
    setNewMaxGrossWeight(veh.maxGrossWeight || '');
    setNewFuelTankCapacity(veh.fuelTankCapacity || '');

    setNewOwnerName(veh.ownerName || '');
    setNewPurchaseDate(veh.purchaseDate || '');
    setNewPurchaseCost(veh.purchaseCost || '');
    setNewVendor(veh.vendor || '');
    setNewWarrantyExpiry(veh.warrantyExpiry || '');
    setNewLeaseType(veh.leaseType || 'Owned');

    setNewAssignedDriver(veh.assignedDriver?._id || veh.assignedDriver || '');
    setNewDepotLocation(veh.depotLocation || '');
    setNewFuelType(veh.fuelType || 'Diesel');
    setNewFuelCardNumber(veh.fuelCardNumber || '');
    setNewMileage(veh.mileage !== undefined ? String(veh.mileage) : '');
    setNewAvgMonthlyFuelConsumption(veh.avgMonthlyFuelConsumption !== undefined ? String(veh.avgMonthlyFuelConsumption) : '');
    setNewVehicleStatus(veh.status || 'available');

    setInsCompany(veh.insurance?.company || '');
    setInsPolicyNumber(veh.insurance?.policyNumber || '');
    setInsCoverageAmount(veh.insurance?.coverageAmount !== undefined ? String(veh.insurance.coverageAmount) : '');
    setInsStartDate(veh.insurance?.startDate || '');
    setInsExpiryDate(veh.insurance?.expiryDate || '');
    setInsReminderDays(veh.insurance?.reminderDays !== undefined ? String(veh.insurance.reminderDays) : '30');

    setRcFile(veh.documents?.rc?.fileName || '');
    setRcIssue(veh.documents?.rc?.issueDate || '');
    setRcExpiry(veh.documents?.rc?.expiryDate || '');

    setInsFile(veh.documents?.insurance?.fileName || '');
    setInsIssue(veh.documents?.insurance?.issueDate || '');
    setInsExpiry(veh.documents?.insurance?.expiryDate || '');

    setPolFile(veh.documents?.pollution?.fileName || '');
    setPolIssue(veh.documents?.pollution?.issueDate || '');
    setPolExpiry(veh.documents?.pollution?.expiryDate || '');

    setFitFile(veh.documents?.fitness?.fileName || '');
    setFitIssue(veh.documents?.fitness?.issueDate || '');
    setFitExpiry(veh.documents?.fitness?.expiryDate || '');

    setPerFile(veh.documents?.permit?.fileName || '');
    setPerIssue(veh.documents?.permit?.issueDate || '');
    setPerExpiry(veh.documents?.permit?.expiryDate || '');

    setTaxFile(veh.documents?.tax?.fileName || '');
    setTaxIssue(veh.documents?.tax?.issueDate || '');
    setTaxExpiry(veh.documents?.tax?.expiryDate || '');

    setShowDocSection(!!(
      veh.documents?.rc?.expiryDate || 
      veh.documents?.insurance?.expiryDate ||
      veh.documents?.pollution?.expiryDate ||
      veh.documents?.fitness?.expiryDate ||
      veh.documents?.permit?.expiryDate ||
      veh.documents?.tax?.expiryDate
    ));
    setShowAddVehicle(true);
  };

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileAvatar(user.avatar || '');
    }
  }, [user]);

  const notifications = useMemo(() => {
    const list = [];
    
    // 1. Scan drivers for license expiry
    drivers.forEach(d => {
      if (d.licenseExpiry) {
        const daysLeft = Math.ceil((new Date(d.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) {
          list.push({
            id: `license-exp-${d._id}`,
            type: 'expiry',
            severity: 'error',
            title: 'License Expired',
            message: `Driver ${d.name}'s Class A license has expired. Status: Suspended.`,
            time: 'Immediate Action Required'
          });
        } else if (daysLeft <= 30) {
          list.push({
            id: `license-exp-${d._id}`,
            type: 'expiry',
            severity: 'warning',
            title: 'License Expiring Soon',
            message: `Driver ${d.name}'s license will expire in ${daysLeft} days.`,
            time: `${daysLeft} days remaining`
          });
        }
      }
    });

    // 2. Scan vehicles for low mileage warnings
    vehicles.forEach(v => {
      if (v.status !== 'retired') {
        if (v.mileage < 6.5) {
          list.push({
            id: `mileage-${v._id}`,
            type: 'fuel',
            severity: 'info',
            title: 'Fuel Efficiency Warning',
            message: `Vehicle ${v.name} (${v.reg}) mileage is sub-optimal (${v.mileage} KM/L). Recommend diagnostic.`,
            time: 'System Audit'
          });
        }
      }
    });

    // 3. Scan active trips
    trips.forEach(t => {
      if (t.status === 'dispatched') {
        list.push({
          id: `trip-disp-${t._id}`,
          type: 'trip',
          severity: 'info',
          title: 'Trip Dispatched',
          message: `Trip ${t.id} dispatched from ${t.source} to ${t.destination}. Driver: ${t.driver?.name || 'N/A'}.`,
          time: 'Active'
        });
      } else if (t.status === 'in_transit') {
        list.push({
          id: `trip-transit-${t._id}`,
          type: 'trip',
          severity: 'success',
          title: 'Trip In Transit',
          message: `Trip ${t.id} is currently in transit between ${t.source} and ${t.destination}.`,
          time: 'In Transit'
        });
      }
    });

    // 4. Scan maintenance records
    maintenance.forEach(m => {
      if (!m.resolved) {
        list.push({
          id: `maint-due-${m._id}`,
          type: 'maintenance',
          severity: 'warning',
          title: 'Unresolved Maintenance Log',
          message: `Vehicle ${m.vehicle?.name || 'Vehicle'} has active log: ${m.issue} (Est cost: ₹${m.cost})`,
          time: 'Awaiting Fix'
        });
      }
    });

    return list;
  }, [vehicles, drivers, trips, maintenance]);

  // Form submit handlers
  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const payload = {
      reg: vReg,
      name: vName,
      type: vType,
      maxLoad: Number(vMaxLoad),
      odometer: Number(vOdometer),
      cost: Number(vCost),

      nickname: newNickname,
      category: vType,
      brand: newBrand,
      model: newModel,
      mfgYear: newMfgYear,
      color: newColor,
      vin: newVin,
      engineNum: newEngineNum,
      regState: newRegState,
      regDate: newRegDate,

      seatingCapacity: newSeatingCapacity,
      cargoCapacity: newCargoCapacity,
      maxGrossWeight: newMaxGrossWeight,
      fuelTankCapacity: newFuelTankCapacity,

      ownerName: newOwnerName,
      purchaseDate: newPurchaseDate,
      purchaseCost: newPurchaseCost,
      vendor: newVendor,
      warrantyExpiry: newWarrantyExpiry,
      leaseType: newLeaseType,

      status: newVehicleStatus,
      assignedDriver: newAssignedDriver || null,
      depotLocation: newDepotLocation,
      fuelType: newFuelType,
      fuelCardNumber: newFuelCardNumber,
      mileage: newMileage ? Number(newMileage) : undefined,
      avgMonthlyFuelConsumption: newAvgMonthlyFuelConsumption ? Number(newAvgMonthlyFuelConsumption) : undefined,

      insurance: {
        company: insCompany,
        policyNumber: insPolicyNumber,
        coverageAmount: insCoverageAmount ? Number(insCoverageAmount) : undefined,
        startDate: insStartDate,
        expiryDate: insExpiryDate,
        reminderDays: insReminderDays ? Number(insReminderDays) : undefined
      },
      documents: {
        rc: { fileName: rcFile || (rcExpiry ? 'RC_Doc.pdf' : ''), issueDate: rcIssue, expiryDate: rcExpiry },
        insurance: { fileName: insFile || (insExpiry ? 'Insurance_Doc.pdf' : ''), issueDate: insIssue, expiryDate: insExpiry },
        pollution: { fileName: polFile || (polExpiry ? 'PUC_Doc.pdf' : ''), issueDate: polIssue, expiryDate: polExpiry },
        fitness: { fileName: fitFile || (fitExpiry ? 'Fitness_Doc.pdf' : ''), issueDate: fitIssue, expiryDate: fitExpiry },
        permit: { fileName: perFile || (perExpiry ? 'Permit_Doc.pdf' : ''), issueDate: perIssue, expiryDate: perExpiry },
        tax: { fileName: taxFile || (taxExpiry ? 'Tax_Doc.pdf' : ''), issueDate: taxIssue, expiryDate: taxExpiry }
      }
    };
    try {
      const url = isEditVehicleMode ? `/api/vehicles/${editVehicleId}` : '/api/vehicles';
      const method = isEditVehicleMode ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        setShowAddVehicle(false);
        resetVehicleForm();
        if (isEditVehicleMode) {
          // Immediately update the vehicles list & dossier so profile refreshes without waiting for fetchData
          setVehicles(prev => prev.map(v => v._id === editVehicleId ? data.data : v));
          if (activeVehicleProfileId === editVehicleId) {
            setSelectedVehicle(data.data);
          }
        }
        fetchData();
      } else {
        setSubmitError(data.message || (isEditVehicleMode ? 'Error updating vehicle' : 'Error adding vehicle'));
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedVehicle(null);
        setActiveVehicleProfileId(null);
        fetchData();
      } else {
        alert(data.message || 'Error deleting vehicle');
      }
    } catch (err) {
      alert('Server connection failure');
    }
  };

  const handleAddDriverSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: dName,
          email: dEmail,
          license: dLicense,
          category: dCategory,
          expiry: dExpiry,
          contact: dContact,
          score: Number(dScore) || 100,
          status: dStatus || 'available',
          aadhaar: dAadhaar,
          pan: dPan,
          bloodGroup: dBloodGroup,
          address: dAddress,
          avatar: dAvatar,
          aadhaarFile: dAadhaarFile,
          panFile: dPanFile,
          dlFile: dDlFile
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowAddDriver(false);
        setDName(''); setDEmail(''); setDLicense(''); setDExpiry(''); setDContact('');
        setDScore(100); setDStatus('available');
        setDAadhaar(''); setDPan(''); setDBloodGroup('O+'); setDAddress('');
        setDAvatar(''); setDAadhaarFile(''); setDPanFile(''); setDDlFile('');
        fetchData();
      } else {
        setSubmitError(data.message || 'Error adding driver');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const startEditDriver = (drv) => {
    setSubmitError('');
    setDName(drv.name);
    setDEmail(drv.email || '');
    setDLicense(drv.license);
    setDCategory(drv.category);
    setDExpiry(drv.expiry ? drv.expiry.split('T')[0] : '');
    setDContact(drv.contact);
    setDScore(drv.score || 100);
    setDStatus(drv.status || 'available');
    setDAadhaar(drv.aadhaar || '');
    setDPan(drv.pan || '');
    setDBloodGroup(drv.bloodGroup || 'O+');
    setDAddress(drv.address || '');
    setDAvatar(drv.avatar || '');
    setDAadhaarFile(drv.aadhaarFile || '');
    setDPanFile(drv.panFile || '');
    setDDlFile(drv.dlFile || '');
    setShowEditDriver(true);
  };

  const handleEditDriverSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const response = await fetch(`/api/drivers/${selectedDriver._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: dName,
          email: dEmail,
          license: dLicense,
          category: dCategory,
          expiry: dExpiry,
          contact: dContact,
          score: Number(dScore),
          status: dStatus,
          aadhaar: dAadhaar,
          pan: dPan,
          bloodGroup: dBloodGroup,
          address: dAddress,
          avatar: dAvatar,
          aadhaarFile: dAadhaarFile,
          panFile: dPanFile,
          dlFile: dDlFile
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowEditDriver(false);
        setSelectedDriver(data.data);
        fetchData();
      } else {
        setSubmitError(data.message || 'Error updating driver profile');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to permanently delete this driver profile?')) {
      return;
    }
    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedDriver(null);
        fetchData();
      } else {
        alert(data.message || 'Error deleting driver');
      }
    } catch (err) {
      alert('Server connection failure');
    }
  };

  const handleDispatchTripSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Pre-validation: Cargo weight must not exceed max cap
    const selectedVeh = vehicles.find(v => v._id === tVehicleId);
    if (selectedVeh && Number(tWeight) > selectedVeh.maxLoad) {
      setSubmitError(`Cargo weight (${tWeight} Tons) exceeds max load capacity (${selectedVeh.maxLoad} Tons) of vehicle.`);
      return;
    }

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          source: tSource,
          destination: tDest,
          vehicleId: tVehicleId,
          driverId: tDriverId,
          weight: Number(tWeight),
          distance: Number(tDistance),
          status: tStatus,
          revenue: tRevenue ? Number(tRevenue) : Math.floor(Number(tDistance) * 4.5),
          driverSalary: tDriverSalary ? Number(tDriverSalary) : undefined,
          estimatedFuelCost: tEstimatedFuelCost ? Number(tEstimatedFuelCost) : undefined,
          actualFuelCost: tActualFuelCost ? Number(tActualFuelCost) : 0
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowDispatchTrip(false);
        setTSource(''); setTDest(''); setTVehicleId(''); setTDriverId(''); setTWeight(''); setTDistance(''); setTStatus('draft'); setTRevenue('');
        setTDriverSalary(''); setTEstimatedFuelCost(''); setTActualFuelCost('');
        fetchData();
      } else {
        setSubmitError(data.message || 'Error dispatching trip');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const handleEditTripSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const selectedVeh = vehicles.find(v => v._id === tVehicleId);
    if (selectedVeh && Number(tWeight) > selectedVeh.maxLoad) {
      setSubmitError(`Cargo weight (${tWeight} Tons) exceeds max load capacity (${selectedVeh.maxLoad} Tons) of vehicle.`);
      return;
    }

    try {
      const response = await fetch(`/api/trips/${editingTripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          source: tSource,
          destination: tDest,
          vehicleId: tVehicleId,
          driverId: tDriverId,
          weight: Number(tWeight),
          distance: Number(tDistance),
          actualDistance: Number(tActualDistance),
          status: tStatus,
          revenue: Number(tRevenue),
          driverSalary: Number(tDriverSalary),
          estimatedFuelCost: Number(tEstimatedFuelCost),
          actualFuelCost: Number(tActualFuelCost)
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowEditTrip(false);
        setTSource(''); setTDest(''); setTVehicleId(''); setTDriverId(''); setTWeight(''); setTDistance(''); setTActualDistance(''); setTStatus('draft'); setTRevenue('');
        setTDriverSalary(''); setTEstimatedFuelCost(''); setTActualFuelCost('');
        fetchData();
      } else {
        setSubmitError(data.message || 'Error updating trip');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const handleCompleteTripSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    try {
      const response = await fetch(`/api/trips/${completeTripId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'completed',
          actualDistance: Number(cActualDistance),
          revenue: Number(cRevenue),
          driverSalary: Number(cDriverSalary),
          actualFuelCost: Number(cActualFuelCost)
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowCompleteTrip(false);
        setCompleteTripId('');
        setCActualDistance('');
        setCRevenue('');
        setCDriverSalary('');
        setCActualFuelCost('');
        fetchData();
      } else {
        setSubmitError(data.message || 'Error completing trip');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const startEditTrip = (trip) => {
    setSubmitError('');
    setEditingTripId(trip._id);
    setTSource(trip.source);
    setTDest(trip.destination);
    setTVehicleId(trip.vehicle?._id || '');
    setTDriverId(trip.driver?._id || '');
    setTWeight(trip.weight);
    setTDistance(trip.distance);
    setTActualDistance(trip.actualDistance || 0);
    setTStatus(trip.status);
    setTRevenue(trip.revenue || 0);
    setTDriverSalary(trip.driverSalary || 0);
    setTEstimatedFuelCost(trip.estimatedFuelCost || 0);
    setTActualFuelCost(trip.actualFuelCost || 0);
    setShowEditTrip(true);
  };

  const startCompleteTrip = (trip) => {
    setSubmitError('');
    setCompleteTripId(trip._id);
    setCActualDistance(trip.distance);
    setCRevenue(Math.floor(Number(trip.distance) * 4.5));
    setCDriverSalary(trip.driverSalary || Math.floor(Number(trip.distance) * 5));
    setCActualFuelCost(trip.actualFuelCost || Math.floor((Number(trip.distance) / (trip.vehicle?.mileage || 10)) * 95));
    setShowCompleteTrip(true);
  };

  const handleProgressTrip = async (tripId, nextStage) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStage })
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Error updating status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to permanently delete this dispatch record?')) {
      return;
    }
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Error deleting trip');
      }
    } catch (err) {
      alert('Server connection failure');
    }
  };

  const handleAddFuelSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: fuelVehicleId,
          type: 'fuel',
          amount: Number(fuelCost),
          liters: Number(fuelLiters),
          odometer: Number(fuelOdometer),
          date: fuelDate || undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowAddFuel(false);
        setFuelVehicleId(''); setFuelLiters(''); setFuelCost(''); setFuelOdometer(''); setFuelDate('');
        fetchData();
      } else {
        setSubmitError(data.message || 'Error adding fuel log');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const handleEditFuelSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const response = await fetch(`/api/expenses/${editingFuelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: fuelVehicleId,
          type: 'fuel',
          amount: Number(fuelCost),
          liters: Number(fuelLiters),
          odometer: Number(fuelOdometer),
          date: fuelDate || undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowEditFuel(false);
        setFuelVehicleId(''); setFuelLiters(''); setFuelCost(''); setFuelOdometer(''); setFuelDate(''); setEditingFuelId('');
        fetchData();
      } else {
        setSubmitError(data.message || 'Error updating fuel log');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const startEditFuel = (log) => {
    setSubmitError('');
    setEditingFuelId(log._id);
    setFuelVehicleId(log.vehicle?._id || '');
    setFuelLiters(log.liters || '');
    setFuelCost(log.amount || '');
    setFuelOdometer(log.odometer || '');
    setFuelDate(log.date ? new Date(log.date).toISOString().split('T')[0] : '');
    setShowEditFuel(true);
  };

  const handleDeleteFuel = async (logId) => {
    if (!window.confirm('Are you sure you want to permanently delete this fuel log?')) {
      return;
    }
    try {
      const response = await fetch(`/api/expenses/${logId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Error deleting fuel log');
      }
    } catch (err) {
      alert('Server connection failure');
    }
  };

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: eVehicleId,
          type: eType,
          amount: Number(eAmount),
          liters: eType === 'fuel' ? Number(eLiters) : 0,
          odometer: eType === 'fuel' ? Number(eOdometer) : 0,
          date: eDate || undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowAddExpense(false);
        setEVehicleId(''); setEAmount(''); setELiters(''); setEOdometer(''); setEDate('');
        fetchData();
      } else {
        setSubmitError(data.message || 'Error adding expense log');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const handleEditExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const response = await fetch(`/api/expenses/${editingExpenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: eVehicleId,
          type: eType,
          amount: Number(eAmount),
          liters: eType === 'fuel' ? Number(eLiters) : 0,
          odometer: eType === 'fuel' ? Number(eOdometer) : 0,
          date: eDate || undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowEditExpense(false);
        setEVehicleId(''); setEAmount(''); setELiters(''); setEOdometer(''); setEDate(''); setEditingExpenseId('');
        fetchData();
      } else {
        setSubmitError(data.message || 'Error updating expense log');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const startEditExpense = (log) => {
    setSubmitError('');
    setEditingExpenseId(log._id);
    setEVehicleId(log.vehicle?._id || '');
    setEType(log.type || 'toll');
    setEAmount(log.amount || '');
    setELiters(log.liters || '');
    setEOdometer(log.odometer || '');
    setEDate(log.date ? new Date(log.date).toISOString().split('T')[0] : '');
    setShowEditExpense(true);
  };

  const handleDeleteExpense = async (logId) => {
    if (!window.confirm('Are you sure you want to permanently delete this expense record?')) {
      return;
    }
    try {
      const response = await fetch(`/api/expenses/${logId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Error deleting expense record');
      }
    } catch (err) {
      alert('Server connection failure');
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: mVehicleId,
          issue: mIssue,
          cost: Number(mCost)
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowMaintenanceModal(false);
        setMVehicleId(''); setMIssue(''); setMCost('');
        fetchData();
      } else {
        setSubmitError(data.message || 'Error adding maintenance log');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const handleCopilotSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!copilotInput.trim()) return;

    const userMessage = copilotInput.trim();
    // Pass chat history (filtered to system roles) for memory
    const history = copilotMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }));

    setCopilotMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setCopilotInput('');
    setCopilotLoading(true);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage, history })
      });
      const data = await res.json();
      if (data.success) {
        setCopilotMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setCopilotMessages(prev => [...prev, { role: 'assistant', content: `⚠️ AI Copilot Error: ${data.message}` }]);
      }
    } catch (err) {
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Server Connection Error: AI engine offline.' }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };



  const handleCloseMaintenance = async (logId) => {
    try {
      const response = await fetch(`/api/maintenance/${logId}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReportData = useMemo(() => {
    let result = [];

    const isWithinDate = (targetDate) => {
      if (!targetDate) return true;
      const d = new Date(targetDate);
      if (reportStartDate && d < new Date(reportStartDate)) return false;
      if (reportEndDate && d > new Date(reportEndDate)) return false;
      return true;
    };

    if (reportType === 'fleet') {
      result = vehicles.map(v => {
        const vehicleExpenses = expenses.filter(e => e.vehicle?._id === v._id && isWithinDate(e.date));
        const fuelCost = vehicleExpenses.filter(e => e.type === 'fuel').reduce((sum, e) => sum + e.amount, 0);
        const maintCost = vehicleExpenses.filter(e => e.type === 'maintenance').reduce((sum, e) => sum + e.amount, 0);
        const otherCost = vehicleExpenses.filter(e => e.type === 'toll' || e.type === 'insurance' || e.type === 'miscellaneous').reduce((sum, e) => sum + e.amount, 0);
        
        const vehicleTrips = trips.filter(t => t.vehicle?._id === v._id && t.status === 'completed' && isWithinDate(t.date || t.createdAt));
        const totalDistance = vehicleTrips.reduce((sum, t) => sum + (t.actualDistance || t.distance), 0);
        const totalCost = vehicleTrips.reduce((sum, t) => sum + t.revenue, 0);

        return {
          id: v._id,
          name: v.name,
          reg: v.reg,
          type: v.type,
          status: v.status,
          fuelCost,
          maintCost,
          otherCost,
          totalOpsCost: fuelCost + maintCost + otherCost,
          revenue: totalCost,
          distance: totalDistance
        };
      });

      if (reportVehicleId) {
        result = result.filter(r => r.id === reportVehicleId);
      }
      if (reportStatus) {
        result = result.filter(r => r.status === reportStatus);
      }
    } 
    else if (reportType === 'driver') {
      result = drivers.map(d => {
        const driverTrips = trips.filter(t => t.driver?._id === d._id && isWithinDate(t.date || t.createdAt));
        const completedTrips = driverTrips.filter(t => t.status === 'completed');
        const totalDistance = completedTrips.reduce((sum, t) => sum + (t.actualDistance || t.distance), 0);
        const salaryEarned = completedTrips.reduce((sum, t) => sum + (t.driverSalary || 0), 0);
        
        return {
          id: d._id,
          name: d.name,
          license: d.licenseNo,
          score: d.score,
          status: d.status,
          tripsCount: driverTrips.length,
          completedCount: completedTrips.length,
          distance: totalDistance,
          salary: salaryEarned
        };
      });

      if (reportDriverId) {
        result = result.filter(r => r.id === reportDriverId);
      }
      if (reportStatus) {
        result = result.filter(r => r.status === reportStatus);
      }
    }
    else if (reportType === 'fuel') {
      expenses.filter(e => e.type === 'fuel').forEach(e => {
        if (isWithinDate(e.date)) {
          if (reportVehicleId && e.vehicle?._id !== reportVehicleId) return;
          result.push({
            id: e._id,
            vehicleName: e.vehicle ? `${e.vehicle.name} (${e.vehicle.reg})` : 'N/A',
            date: e.date,
            liters: e.liters,
            amount: e.amount,
            odometer: e.odometer
          });
        }
      });
    }
    else if (reportType === 'expense') {
      expenses.filter(e => e.type !== 'fuel').forEach(e => {
        if (isWithinDate(e.date)) {
          if (reportVehicleId && e.vehicle?._id !== reportVehicleId) return;
          result.push({
            id: e._id,
            vehicleName: e.vehicle ? `${e.vehicle.name} (${e.vehicle.reg})` : 'N/A',
            type: e.type,
            date: e.date,
            amount: e.amount
          });
        }
      });
    }
    else if (reportType === 'maintenance') {
      maintenance.forEach(m => {
        if (isWithinDate(m.date || m.createdAt)) {
          if (reportVehicleId && m.vehicle?._id !== reportVehicleId) return;
          result.push({
            id: m._id,
            vehicleName: m.vehicle ? `${m.vehicle.name} (${m.vehicle.reg})` : 'N/A',
            issue: m.issue,
            cost: m.cost,
            resolved: m.resolved ? 'RESOLVED' : 'PENDING',
            date: m.date || m.createdAt
          });
        }
      });
    }
    else if (reportType === 'cost') {
      trips.forEach(t => {
        if (isWithinDate(t.date || t.createdAt)) {
          if (reportVehicleId && t.vehicle?._id !== reportVehicleId) return;
          if (reportDriverId && t.driver?._id !== reportDriverId) return;
          result.push({
            id: t._id,
            tripId: t.id,
            route: `${t.source} ➜ ${t.destination}`,
            revenue: t.revenue,
            salary: t.driverSalary || 0,
            estimatedFuel: t.estimatedFuelCost || 0,
            actualFuel: t.actualFuelCost || 0,
            distance: t.actualDistance || t.distance
          });
        }
      });
    }

    return result;
  }, [reportType, reportStartDate, reportEndDate, reportVehicleId, reportDriverId, reportStatus, vehicles, drivers, trips, expenses, maintenance]);

  // CSV Export utility
  const handleExportCSV = () => {
    if (filteredReportData.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'fleet') {
      csvContent += "Vehicle,Reg,Type,Status,Fuel Cost,Maint Cost,Other Cost,Total Ops Cost,Revenue,Distance\n";
      filteredReportData.forEach(r => {
        csvContent += `"${r.name}","${r.reg}","${r.type}","${r.status}",${r.fuelCost},${r.maintCost},${r.otherCost},${r.totalOpsCost},${r.revenue},${r.distance}\n`;
      });
    } 
    else if (reportType === 'driver') {
      csvContent += "Driver Name,License,Safety Score,Status,Trips Count,Completed Count,Distance,Salary Earned\n";
      filteredReportData.forEach(r => {
        csvContent += `"${r.name}","${r.license}",${r.score},"${r.status}",${r.tripsCount},${r.completedCount},${r.distance},${r.salary}\n`;
      });
    }
    else if (reportType === 'fuel') {
      csvContent += "Vehicle,Date,Liters,Amount,Odometer\n";
      filteredReportData.forEach(r => {
        csvContent += `"${r.vehicleName}","${new Date(r.date).toLocaleDateString()}",${r.liters},${r.amount},${r.odometer}\n`;
      });
    }
    else if (reportType === 'expense') {
      csvContent += "Vehicle,Type,Date,Amount\n";
      filteredReportData.forEach(r => {
        csvContent += `"${r.vehicleName}","${r.type}","${new Date(r.date).toLocaleDateString()}",${r.amount}\n`;
      });
    }
    else if (reportType === 'maintenance') {
      csvContent += "Vehicle,Issue,Cost,Status,Date\n";
      filteredReportData.forEach(r => {
        csvContent += `"${r.vehicleName}","${r.issue}",${r.cost},"${r.resolved}","${new Date(r.date).toLocaleDateString()}"\n`;
      });
    }
    else if (reportType === 'cost') {
      csvContent += "Trip ID,Route,Distance (KM),Revenue (Total Cost),Driver Salary,Est Fuel,Actual Fuel\n";
      filteredReportData.forEach(r => {
        csvContent += `"${r.tripId}","${r.route}",${r.distance},${r.revenue},${r.salary},${r.estimatedFuel},${r.actualFuel}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Dynamic KPI Computations
  const totalVehiclesCount = vehicles.length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'on_trip').length;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'available').length;
  const maintenanceVehiclesCount = vehicles.filter(v => v.status === 'in_shop').length;

  const activeTripsCount = trips.filter(t => t.status === 'dispatched').length;
  const pendingTripsCount = trips.filter(t => t.status === 'draft' || t.status === 'scheduled').length;

  const driversOnDutyCount = drivers.filter(d => d.status === 'on_duty').length;
  const fleetUtilizationPercent = totalVehiclesCount > 0 ? ((activeVehiclesCount / totalVehiclesCount) * 100).toFixed(1) : 0;

  // Filtered Lists
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.reg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterTypeVeh === 'all' || v.status === filterTypeVeh;
    return matchesSearch && matchesFilter;
  });

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.license.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || d.status === filterType;
    return matchesSearch && matchesFilter;
  });

  // Pools for Trip Dispatching
  const dispatchableVehicles = vehicles.filter(v => v.status === 'available');
  const dispatchableDrivers = drivers.filter(d => {
    const isAvail = d.status === 'available';
    const notExpired = new Date(d.expiry) > new Date();
    return isAvail && notExpired;
  });

  // Charts data
  const fuelChartData = reports.map(r => ({
    name: r.reg,
    efficiency: r.fuelEfficiency
  }));

  const roiChartData = reports.map(r => ({
    name: r.reg,
    roi: Number((r.roi * 100).toFixed(2))
  }));

  if (loading) {
    return (
      <div className="h-screen w-screen bg-clay-canvas flex items-center justify-center font-body">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="truck-loader-anim text-clay-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-7xl font-black shadow-clayCard">local_shipping</span>
          </div>
          <div className="road-line w-24 h-1.5 border border-border mt-1"></div>
          <span className="font-mono text-xs uppercase tracking-widest text-clay-muted font-black animate-pulse pt-2">
            Loading Operations Console...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-clay-canvas text-clay-foreground select-none relative flex font-body overflow-hidden">

      {/* High-Fidelity Animated 3D Blobs in background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute h-[60vh] w-[60vh] rounded-full blur-3xl bg-clay-primary/10 -top-[10%] -left-[10%] clay-blob-anim-1"></div>
        <div className="absolute h-[50vh] w-[50vh] rounded-full blur-3xl bg-clay-secondary/10 -right-[5%] top-[15%] clay-blob-anim-2"></div>
        <div className="absolute h-[55vh] w-[55vh] rounded-full blur-3xl bg-clay-tertiary/10 -bottom-[15%] left-[25%] clay-blob-anim-3"></div>
      </div>

      {/* Sidebar Navigation - Scrollable nav with pinned profile at bottom */}
      <aside className={`h-full bg-white/60 backdrop-blur-xl border-white/80 hidden md:flex flex-col flex-shrink-0 relative z-10 transition-all duration-300 ${sidebarVisible ? 'w-72 border-r-2 opacity-100' : 'w-0 border-r-0 opacity-0 overflow-hidden pointer-events-none'
        }`}>

        {/* Logo - pinned at top */}
        <div className="flex items-center gap-3 px-8 pt-8 pb-4 flex-shrink-0">
          <img src={logo} className="w-10 h-10 object-contain rounded-2xl shadow-clayButton" alt="TransitOps" />
          <span className="font-black text-2xl tracking-tight text-clay-foreground uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>TransitOps</span>
        </div>

        {/* Scrollable Nav list */}
        <nav className="flex flex-col gap-3 flex-1 overflow-y-auto px-8 py-2" style={{ scrollbarWidth: 'none' }}>
          {[
            { id: 'overview', icon: LayoutGrid, label: 'Overview' },
            { id: 'vehicles', icon: Truck, label: 'Vehicles Registry' },
            { id: 'drivers', icon: Users, label: 'Driver Crew' },
            { id: 'schedule', icon: Calendar, label: 'Dispatch Log' },
            { id: 'maintenance', icon: Wrench, label: 'Maintenance Log' },
            { id: 'fuel', icon: Fuel, label: 'Fuel Logs' },
            { id: 'expenses', icon: CircleDollarSign, label: 'Expense Logs' },
            { id: 'reports', icon: TrendingUp, label: 'Reports & ROI' },
            { id: 'copilot', icon: Sparkles, label: 'AI Fleet Copilot' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveMenu(item.id); setSearchQuery(''); }}
                className={`flex items-center gap-4 px-6 py-4 rounded-[20px] font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer flex-shrink-0 ${isActive
                    ? 'bg-gradient-to-br from-white to-[#F0EBF7] text-clay-primary shadow-clayCard translate-x-1.5'
                    : 'text-clay-muted hover:text-clay-primary hover:bg-white/30'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-clay-primary' : 'text-clay-muted'}`} />
                <span style={{ fontFamily: "Nunito, sans-serif" }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Card & Signout - pinned at bottom */}
        <div className="space-y-4 px-8 py-6 flex-shrink-0 border-t border-white/60">
          <div className="p-4 bg-white/80 rounded-[24px] border border-white/60 shadow-clayCard flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-clay-primary/20 flex items-center justify-center font-bold text-clay-primary text-sm shadow-clayCard">
              {user ? user.name[0].toUpperCase() : 'M'}
            </div>
            <div className="overflow-hidden">
              <div className="font-black text-sm truncate uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>{user ? user.name : 'Operator'}</div>
              <div className="text-[10px] text-clay-muted font-bold uppercase truncate tracking-wider">{user ? user.role.replace('_', ' ') : 'Fleet Manager'}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-white text-clay-muted hover:text-error hover:bg-red-50 px-6 py-4 rounded-[20px] border-2 border-transparent hover:border-red-100 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.95] cursor-pointer shadow-clayCard"
          >
            <LogOut className="w-4 h-4" />
            <span style={{ fontFamily: "Nunito, sans-serif" }}>System Signout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane - Scrolls independently of the sidebar */}
      <main className="flex-1 h-full p-6 md:p-12 overflow-y-auto relative z-10 w-full">

        {/* Navigation Tabs for Mobile view */}
        <div className="flex flex-wrap gap-2 bg-white/40 p-2 rounded-[20px] mb-8 border border-white/40 shadow-clayCard md:hidden">
          {['overview', 'vehicles', 'drivers', 'schedule', 'maintenance', 'fuel', 'expenses', 'reports', 'copilot', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveMenu(tab); setSearchQuery(''); }}
              className={`flex-1 py-3 text-[10px] font-bold rounded-[14px] uppercase tracking-wider transition-all duration-300 ${activeMenu === tab ? 'bg-white text-clay-primary shadow-clayCard' : 'text-clay-muted'
                }`}
            >
              {tab === 'schedule' ? 'Trips' : tab}
            </button>
          ))}
        </div>

        {/* Dashboard Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="flex items-start gap-4">
            <button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="mt-1 md:mt-2 p-3 bg-white border border-white/60 text-clay-primary rounded-[18px] shadow-clayCard hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
              title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: "Nunito, sans-serif" }}>
                {activeMenu === 'overview' && 'Operations Dashboard'}
                {activeMenu === 'vehicles' && 'Vehicles Registry'}
                {activeMenu === 'drivers' && 'Driver Crew'}
                {activeMenu === 'schedule' && 'Dispatch Log'}
                {activeMenu === 'maintenance' && 'Maintenance Log'}
                {activeMenu === 'fuel' && 'Fuel Management'}
                {activeMenu === 'expenses' && 'Expense Management'}
                {activeMenu === 'reports' && 'Reports & Analytics'}
                {activeMenu === 'copilot' && 'AI Fleet Copilot'}
                {activeMenu === 'settings' && 'Platform Settings'}
              </h1>
              <p className="text-clay-muted font-medium text-sm md:text-base mt-1">
                Active operations pipeline monitor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
              className="relative p-2.5 bg-white border border-white/60 text-clay-primary rounded-full shadow-clayCard hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              {notifications.filter(n => !readNotificationIds.includes(n.id)).length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {notifications.filter(n => !readNotificationIds.includes(n.id)).length}
                </span>
              )}
            </button>

            <div className="bg-white/80 backdrop-blur-xl border border-white px-4 py-2 rounded-full shadow-clayCard text-xs font-bold font-mono tracking-wide text-clay-primary flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>ROLE: {user ? user.role.toUpperCase().replace('_', ' ') : 'FLEET MANAGER'}</span>
            </div>
          </div>
        </div>

        {/* Global Safety Alert Banner */}
        <AnimatePresence>
          {safetyAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-clay-secondary/15 border-2 border-clay-secondary text-clay-foreground p-5 rounded-[24px] mb-8 shadow-clayCard flex justify-between items-start"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-clay-secondary text-white rounded-xl flex items-center justify-center shadow-clayButton">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>{safetyAlert.title}</h4>
                  <p className="text-xs text-clay-muted mt-1 leading-relaxed">{safetyAlert.message}</p>
                </div>
              </div>
              <button onClick={() => setSafetyAlert(null)} className="text-clay-muted hover:text-clay-foreground">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
           TAB 1: OVERVIEW (DASHBOARD KPIs)
           ======================================================== */}
        {activeMenu === 'overview' && (
          <div className="space-y-10">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Active Transit Vehicles', val: activeVehiclesCount, desc: 'On active routes', color: 'text-clay-primary' },
                { title: 'Available Vehicles', val: availableVehiclesCount, desc: 'Ready for dispatch', color: 'text-clay-success' },
                { title: 'Vehicles in Maintenance', val: maintenanceVehiclesCount, desc: 'In Shop status logs', color: 'text-clay-secondary' },
                { title: 'Active Trips Dispatched', val: activeTripsCount, desc: 'In-Transit shipments', color: 'text-clay-tertiary' },
                { title: 'Pending Trips Draft', val: pendingTripsCount, desc: 'Scheduled pipeline', color: 'text-clay-muted' },
                { title: 'Drivers On Duty', val: driversOnDutyCount, desc: 'On-Road personnel', color: 'text-clay-primary' },
                { title: 'Fleet Utilization', val: `${fleetUtilizationPercent}%`, desc: 'Active/Total registered', color: 'text-clay-warning' }
              ].map((kpi, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[32px] p-6 shadow-clayCard border border-white/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-44 group cursor-pointer"
                >
                  <span className="font-mono text-[9px] text-clay-muted font-bold uppercase tracking-wider">
                    {kpi.title}
                  </span>
                  <div>
                    <h3 className={`text-4xl font-black tracking-tight ${kpi.color}`} style={{ fontFamily: "Nunito, sans-serif" }}>{kpi.val}</h3>
                    <p className="text-[10px] text-clay-muted font-bold uppercase mt-1 tracking-wide">{kpi.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-[32px] p-8 shadow-clayCard border border-white/60 space-y-6">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Quick Command Center</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">

                <button
                  onClick={() => { setSubmitError(''); setShowDispatchTrip(true); }}
                  className="flex items-center justify-between p-5 rounded-[24px] bg-gradient-to-br from-white to-[#F0EBF7] border border-white/80 shadow-clayCard hover:-translate-y-1 hover:shadow-lg active:scale-[0.95] transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-clay-primary/10 text-clay-primary rounded-xl flex items-center justify-center shadow-clayCard">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                    <span className="font-bold text-xs uppercase text-clay-foreground text-left" style={{ fontFamily: "Nunito, sans-serif" }}>Dispatch Trip</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-clay-primary" />
                </button>

                <button
                  onClick={() => { setSubmitError(''); setShowMaintenanceModal(true); }}
                  className="flex items-center justify-between p-5 rounded-[24px] bg-gradient-to-br from-white to-[#FFF5F8] border border-white/80 shadow-clayCard hover:-translate-y-1 hover:shadow-lg active:scale-[0.95] transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-clay-secondary/10 text-clay-secondary rounded-xl flex items-center justify-center shadow-clayCard">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xs uppercase text-clay-foreground text-left" style={{ fontFamily: "Nunito, sans-serif" }}>Log Service</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-clay-secondary" />
                </button>

                <button
                  onClick={() => { setSubmitError(''); setShowAddFuel(true); }}
                  className="flex items-center justify-between p-5 rounded-[24px] bg-gradient-to-br from-white to-[#F0F9FF] border border-white/80 shadow-clayCard hover:-translate-y-1 hover:shadow-lg active:scale-[0.95] transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-clay-tertiary/10 text-clay-tertiary rounded-xl flex items-center justify-center shadow-clayCard">
                      <CircleDollarSign className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xs uppercase text-clay-foreground text-left" style={{ fontFamily: "Nunito, sans-serif" }}>Log Fuel/Toll</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-clay-tertiary" />
                </button>

                <button
                  onClick={() => { setSubmitError(''); resetVehicleForm(); setShowAddVehicle(true); }}
                  className="flex items-center justify-between p-5 rounded-[24px] bg-gradient-to-br from-white to-[#F0FDF4] border border-white/80 shadow-clayCard hover:-translate-y-1 hover:shadow-lg active:scale-[0.95] transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-clay-success/10 text-clay-success rounded-xl flex items-center justify-center shadow-clayCard">
                      <Truck className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xs uppercase text-clay-foreground text-left" style={{ fontFamily: "Nunito, sans-serif" }}>Add Vehicle</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-clay-success" />
                </button>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================
           TAB 2: VEHICLES REGISTRY
           ======================================================== */}
        {activeMenu === 'vehicles' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/40 p-4 rounded-[24px] border border-white/40 shadow-clayCard">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search registration or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-5 py-3.5 pr-12 rounded-[20px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs placeholder-clay-muted"
                />
                <Search className="absolute right-4 top-3.5 w-4 h-4 text-clay-muted" />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={filterTypeVeh}
                  onChange={(e) => setFilterTypeVeh(e.target.value)}
                  className="bg-white border border-white/60 text-clay-muted font-bold text-xs px-4 py-3.5 rounded-[20px] shadow-clayCard focus:outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="in_shop">In Shop</option>
                  <option value="retired">Retired</option>
                </select>

                <button
                  onClick={() => { setSubmitError(''); resetVehicleForm(); setShowAddVehicle(true); }}
                  className="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-bold text-xs px-5 py-3.5 rounded-[20px] shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none uppercase tracking-wider cursor-pointer"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  <Plus className="w-4 h-4 font-black" />
                  <span>Add Vehicle</span>
                </button>
              </div>
            </div>

            {/* ── VEHICLE DOSSIER FULL-PAGE VIEW ── */}
            {activeVehicleProfileId && vehicles.find(v => v._id === activeVehicleProfileId) ? (
              (() => {
                const activeVeh = vehicles.find(v => v._id === activeVehicleProfileId);
                const vehicleTrips = trips.filter(t =>
                  t.vehicle?._id?.toString() === activeVeh._id.toString() ||
                  t.vehicleId === activeVeh._id
                );
                const docList = [
                  { label: 'RC (Registration Certificate)', key: 'rc', color: 'emerald', icon: '🪪' },
                  { label: 'Insurance Policy', key: 'insurance', color: 'blue', icon: '🛡️' },
                  { label: 'Pollution Certificate (PUC)', key: 'pollution', color: 'green', icon: '🌿' },
                  { label: 'Fitness Certificate', key: 'fitness', color: 'violet', icon: '✅' },
                  { label: 'Road Permit', key: 'permit', color: 'amber', icon: '🛣️' },
                  { label: 'Tax Receipt', key: 'tax', color: 'sky', icon: '📋' },
                ];

                const colorMap = {
                  emerald: { card: 'from-emerald-50 via-white to-emerald-50/30', border: 'border-emerald-100', hdr: 'text-emerald-800', sub: 'text-emerald-700', lbl: 'text-emerald-600/70', badge: 'bg-emerald-600/10 text-emerald-700', btn: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200' },
                  blue:    { card: 'from-blue-50 via-white to-blue-50/30',    border: 'border-blue-100',    hdr: 'text-blue-800',    sub: 'text-blue-700',    lbl: 'text-blue-600/70',    badge: 'bg-blue-600/10 text-blue-700',    btn: 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200' },
                  green:   { card: 'from-teal-50 via-white to-teal-50/30',    border: 'border-teal-100',    hdr: 'text-teal-800',    sub: 'text-teal-700',    lbl: 'text-teal-600/70',    badge: 'bg-teal-600/10 text-teal-700',    btn: 'bg-teal-100 hover:bg-teal-200 text-teal-800 border-teal-200' },
                  violet:  { card: 'from-violet-50 via-white to-violet-50/30',border: 'border-violet-100',  hdr: 'text-violet-800',  sub: 'text-violet-700',  lbl: 'text-violet-600/70',  badge: 'bg-violet-600/10 text-violet-700',  btn: 'bg-violet-100 hover:bg-violet-200 text-violet-800 border-violet-200' },
                  amber:   { card: 'from-amber-50 via-white to-amber-50/30',  border: 'border-amber-100',   hdr: 'text-amber-800',   sub: 'text-amber-700',   lbl: 'text-amber-600/70',   badge: 'bg-amber-600/10 text-amber-700',   btn: 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200' },
                  sky:     { card: 'from-sky-50 via-white to-sky-50/30',      border: 'border-sky-100',     hdr: 'text-sky-800',     sub: 'text-sky-700',     lbl: 'text-sky-600/70',     badge: 'bg-sky-600/10 text-sky-700',     btn: 'bg-sky-100 hover:bg-sky-200 text-sky-800 border-sky-200' },
                };

                return (
                  <div className="space-y-8">
                    {/* ── Dossier Header Bar ── */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 p-5 rounded-[28px] border border-white/40 shadow-clayCard">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => { setActiveVehicleProfileId(null); setSelectedVehicle(null); setVehicleDossierTab('documents'); }}
                          className="p-3 bg-white border border-white/60 text-clay-primary rounded-[20px] shadow-clayCard hover:scale-105 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        {/* Vehicle Icon */}
                        <div className="w-14 h-14 rounded-full bg-clay-primary/10 flex items-center justify-center shadow-clayCard flex-shrink-0">
                          <Truck className="w-7 h-7 text-clay-primary" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="font-headline text-3xl font-black uppercase text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                              {activeVeh.name}
                            </h2>
                            <span className={`px-3.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              activeVeh.status === 'available' ? 'bg-clay-success/15 text-clay-success' :
                              activeVeh.status === 'on_trip' ? 'bg-clay-tertiary/15 text-clay-tertiary' :
                              activeVeh.status === 'in_shop' ? 'bg-clay-secondary/15 text-clay-secondary' : 'bg-red-100 text-red-700'
                            }`}>
                              {activeVeh.status?.replace('_', ' ') || 'Active'}
                            </span>
                          </div>
                          <p className="font-mono text-[9px] text-clay-muted font-bold uppercase tracking-wider mt-1">
                            {activeVeh.reg} &nbsp;•&nbsp; Vehicle Fleet Dossier
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEditVehicle(activeVeh)}
                          className="bg-white text-clay-primary border border-white/60 font-bold text-xs px-5 py-3.5 rounded-[20px] shadow-clayCard hover:-translate-y-0.5 active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                          style={{ fontFamily: 'Nunito, sans-serif' }}
                        >
                          Edit Vehicle
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(activeVeh._id)}
                          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs px-5 py-3.5 rounded-[20px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                          style={{ fontFamily: 'Nunito, sans-serif' }}
                        >
                          Delete Vehicle
                        </button>
                      </div>
                    </div>

                    {/* ── Insurance Expiry Alert ── */}
                    {activeVeh.insurance?.expiryDate && (() => {
                      const days = Math.ceil((new Date(activeVeh.insurance.expiryDate) - new Date()) / (1000*60*60*24));
                      if (days < 0) return (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-[24px] flex items-center gap-3 shadow-clayCard animate-pulse">
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          <span className="font-mono text-xs font-black uppercase text-red-700">INSURANCE EXPIRED! Policy expired on {activeVeh.insurance.expiryDate}. Renew immediately.</span>
                        </div>
                      );
                      if (days <= 30) return (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-[24px] flex items-center gap-3 shadow-clayCard">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          <span className="font-mono text-xs font-black uppercase text-yellow-700">INSURANCE EXPIRES IN {days} DAYS — {activeVeh.insurance.company}</span>
                        </div>
                      );
                      return null;
                    })()}

                    {/* ── Split Layout ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                      {/* LEFT — Specs Panel */}
                      <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-[32px] p-8 border border-white/60 shadow-clayCard space-y-6">
                          {/* Vehicle Icon + Name */}
                          <div className="flex gap-4 items-center border-b border-slate-100 pb-5">
                            <div className="w-16 h-16 rounded-full bg-clay-primary/10 flex items-center justify-center shadow-clayCard flex-shrink-0">
                              <Truck className="w-8 h-8 text-clay-primary" />
                            </div>
                            <div>
                              <h4 className="font-headline font-black text-xl text-clay-foreground uppercase" style={{ fontFamily: 'Nunito, sans-serif' }}>{activeVeh.name}</h4>
                              <p className="font-mono text-[9px] text-clay-muted font-bold uppercase tracking-widest mt-0.5">
                                {activeVeh.brand} {activeVeh.model} {activeVeh.mfgYear && `• ${activeVeh.mfgYear}`}
                              </p>
                            </div>
                          </div>

                          {/* Key Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: 'Registration', value: activeVeh.reg },
                              { label: 'Type', value: activeVeh.type },
                              { label: 'Fuel Type', value: activeVeh.fuelType || 'Diesel' },
                              { label: 'Color', value: activeVeh.color || 'N/A' },
                              { label: 'Odometer', value: `${activeVeh.odometer} KM` },
                              { label: 'Max Load', value: `${activeVeh.maxLoad} T` },
                            ].map(s => (
                              <div key={s.label} className="bg-clay-canvas/50 p-3 rounded-[16px] border border-white/60">
                                <span className="font-mono text-[8px] text-clay-muted font-black uppercase tracking-wider block">{s.label}</span>
                                <p className="font-black text-sm text-clay-foreground mt-0.5" style={{ fontFamily: 'Nunito, sans-serif' }}>{s.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Detail rows */}
                          <div className="space-y-3 text-xs font-bold border-t border-slate-100 pt-4">
                            {activeVeh.vin && <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-clay-muted uppercase">VIN / Chassis</span><span className="font-mono">{activeVeh.vin}</span></div>}
                            {activeVeh.engineNum && <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-clay-muted uppercase">Engine No.</span><span className="font-mono">{activeVeh.engineNum}</span></div>}
                            {activeVeh.seatingCapacity && <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-clay-muted uppercase">Seating</span><span>{activeVeh.seatingCapacity} seats</span></div>}
                            {activeVeh.fuelTankCapacity && <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-clay-muted uppercase">Fuel Tank</span><span>{activeVeh.fuelTankCapacity} L</span></div>}
                            {activeVeh.mileage && <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-clay-muted uppercase">Mileage</span><span>{activeVeh.mileage} KM/L</span></div>}
                            {activeVeh.depotLocation && <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-clay-muted uppercase">Depot</span><span>{activeVeh.depotLocation}</span></div>}
                            {activeVeh.ownerName && <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-clay-muted uppercase">Owner</span><span>{activeVeh.ownerName} ({activeVeh.leaseType})</span></div>}
                            {activeVeh.purchaseCost && <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-clay-muted uppercase">Purchase Cost</span><span>₹{Number(activeVeh.purchaseCost).toLocaleString()}</span></div>}
                            {activeVeh.warrantyExpiry && <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-clay-muted uppercase">Warranty Until</span><span>{activeVeh.warrantyExpiry}</span></div>}
                            {activeVeh.fuelCardNumber && <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-clay-muted uppercase">Fuel Card</span><span className="font-mono">{activeVeh.fuelCardNumber}</span></div>}
                            {activeVeh.assignedDriver && <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-clay-muted uppercase">Assigned Driver</span><span>{activeVeh.assignedDriver?.name || activeVeh.assignedDriver}</span></div>}
                          </div>

                          {/* Insurance mini card */}
                          {activeVeh.insurance?.company && (
                            <div className="bg-clay-canvas/50 p-5 rounded-[24px] border border-white/60 shadow-clayPressed space-y-2">
                              <span className="font-mono text-[8px] text-clay-primary font-black uppercase tracking-wider">Insurance Coverage</span>
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-clay-muted">Company</span>
                                <span>{activeVeh.insurance.company}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-clay-muted">Policy No.</span>
                                <span className="font-mono">{activeVeh.insurance.policyNumber}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-clay-muted">Coverage</span>
                                <span>₹{Number(activeVeh.insurance.coverageAmount).toLocaleString()}</span>
                              </div>
                              {activeVeh.insurance.expiryDate && (
                                <div className="flex justify-between items-center text-xs font-bold">
                                  <span className="text-clay-muted">Valid Until</span>
                                  <span className={`${getDocStatus(activeVeh.insurance.expiryDate).color} px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-extrabold`}>
                                    {activeVeh.insurance.expiryDate}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* GPS Card */}
                        <div className="bg-white rounded-[32px] p-8 border border-white/60 shadow-clayCard">
                          <GPSCard vehicle={activeVeh} />
                        </div>
                      </div>

                      {/* RIGHT — Tabs Panel */}
                      <div className="lg:col-span-7 space-y-6">
                        {/* Tab toggle */}
                        <div className="flex bg-white/40 p-2 rounded-[20px] border border-white/40 shadow-clayCard">
                          <button
                            onClick={() => setVehicleDossierTab('documents')}
                            className={`flex-1 py-3.5 text-xs font-black rounded-[16px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${vehicleDossierTab === 'documents' ? 'bg-white text-clay-primary shadow-clayCard' : 'text-clay-muted hover:text-clay-primary'}`}
                            style={{ fontFamily: 'Nunito, sans-serif' }}
                          >
                            Compliance Documents
                          </button>
                          <button
                            onClick={() => setVehicleDossierTab('trips')}
                            className={`flex-1 py-3.5 text-xs font-black rounded-[16px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${vehicleDossierTab === 'trips' ? 'bg-white text-clay-primary shadow-clayCard' : 'text-clay-muted hover:text-clay-primary'}`}
                            style={{ fontFamily: 'Nunito, sans-serif' }}
                          >
                            Trip History ({vehicleTrips.length})
                          </button>
                        </div>

                        {/* Documents Tab — govt card styled (Aadhaar format) */}
                        {vehicleDossierTab === 'documents' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {docList.map(({ label, key, color, icon }) => {
                              const doc = activeVeh.documents?.[key];
                              const status = doc?.expiryDate ? getDocStatus(doc.expiryDate) : null;

                              // Custom Color Palette for Govt ID styling
                              const govtColorMap = {
                                emerald: { 
                                  card: 'bg-[#F4FAF7] border-[#D1ECE0]', 
                                  hdr: 'text-[#0F6F47]', 
                                  sub: 'text-[#1B8055]', 
                                  lbl: 'text-[#0A5C3A]/60', 
                                  badge: 'bg-[#E3F6EE] text-[#0A5C3A]', 
                                  photoBox: 'bg-[#E3F6EE] border-[#B9E9D5] text-[#0A5C3A]',
                                  btn: 'bg-gradient-to-br from-[#E3F6EE] to-[#D1ECE0] border-[#B9E9D5] text-[#0A5C3A] hover:bg-white hover:text-emerald-700',
                                  spacedNum: 'text-[#1C2D24]'
                                },
                                blue: { 
                                  card: 'bg-[#F0F5FF] border-[#D0E0FF]', 
                                  hdr: 'text-[#1E40AF]', 
                                  sub: 'text-[#2563EB]', 
                                  lbl: 'text-[#1E40AF]/60', 
                                  badge: 'bg-[#E0EBFF] text-[#1E40AF]', 
                                  photoBox: 'bg-[#E0EBFF] border-[#C2D6FF] text-[#1E40AF]',
                                  btn: 'bg-gradient-to-br from-[#E0EBFF] to-[#C2D6FF] border-[#B2CCFF] text-[#1E40AF] hover:bg-white hover:text-blue-700',
                                  spacedNum: 'text-[#1E293B]'
                                },
                                green: { 
                                  card: 'bg-[#F5FAF6] border-[#D2ECDC]', 
                                  hdr: 'text-[#15803D]', 
                                  sub: 'text-[#16A34A]', 
                                  lbl: 'text-[#15803D]/60', 
                                  badge: 'bg-[#E2F5E9] text-[#15803D]', 
                                  photoBox: 'bg-[#E2F5E9] border-[#C2EBCF] text-[#15803D]',
                                  btn: 'bg-gradient-to-br from-[#E2F5E9] to-[#C2EBCF] border-[#B2E2C2] text-[#15803D] hover:bg-white hover:text-green-700',
                                  spacedNum: 'text-[#1C2D24]'
                                },
                                violet: { 
                                  card: 'bg-[#FAF5FF] border-[#EAD8FC]', 
                                  hdr: 'text-[#6D28D9]', 
                                  sub: 'text-[#7C3AED]', 
                                  lbl: 'text-[#6D28D9]/60', 
                                  badge: 'bg-[#F3E8FF] text-[#6D28D9]', 
                                  photoBox: 'bg-[#F3E8FF] border-[#E5D0FA] text-[#6D28D9]',
                                  btn: 'bg-gradient-to-br from-[#F3E8FF] to-[#E5D0FA] border-[#D8B4FE] text-[#6D28D9] hover:bg-white hover:text-purple-700',
                                  spacedNum: 'text-[#2E1065]'
                                },
                                amber: { 
                                  card: 'bg-[#FFFBEB] border-[#FDE68A]', 
                                  hdr: 'text-[#B45309]', 
                                  sub: 'text-[#D97706]', 
                                  lbl: 'text-[#B45309]/60', 
                                  badge: 'bg-[#FEF3C7] text-[#B45309]', 
                                  photoBox: 'bg-[#FEF3C7] border-[#FDE047] text-[#B45309]',
                                  btn: 'bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] border-[#FCD34D] text-[#B45309] hover:bg-white hover:text-amber-700',
                                  spacedNum: 'text-[#451A03]'
                                },
                                sky: { 
                                  card: 'bg-[#F0F9FF] border-[#BAE6FD]', 
                                  hdr: 'text-[#0369A1]', 
                                  sub: 'text-[#0284C7]', 
                                  lbl: 'text-[#0369A1]/60', 
                                  badge: 'bg-[#E0F2FE] text-[#0369A1]', 
                                  photoBox: 'bg-[#E0F2FE] border-[#B3E1FC] text-[#0369A1]',
                                  btn: 'bg-gradient-to-br from-[#E0F2FE] to-[#B3E1FC] border-[#7DD3FC] text-[#0369A1] hover:bg-white hover:text-sky-700',
                                  spacedNum: 'text-[#082F49]'
                                }
                              };

                              const c = govtColorMap[color] || govtColorMap.emerald;

                              // Metadata for Govt cards
                              const getGovtCardInfo = (docKey, v) => {
                                switch (docKey) {
                                  case 'rc':
                                    return {
                                      govt: 'BHARAT SARKAR (GOVT OF INDIA)',
                                      agency: 'Ministry of Road Transport & Highways (MoRTH)',
                                      type: 'REGISTRATION CERTIFICATE (RC)',
                                      badge: 'UID',
                                      numberLabel: 'REGISTRATION NUMBER',
                                      numberValue: v.reg || 'N/A',
                                      photoIcon: 'local_shipping'
                                    };
                                  case 'insurance':
                                    return {
                                      govt: 'INSURANCE REGULATORY & DEVELOPMENT AUTHORITY',
                                      agency: 'Govt Registered Commercial Carrier Insurance',
                                      type: 'COMMERCIAL CARRIER POLICY',
                                      badge: 'INS',
                                      numberLabel: 'POLICY CERTIFICATE NUMBER',
                                      numberValue: v.insurance?.policyNumber || 'N/A',
                                      photoIcon: 'shield'
                                    };
                                  case 'pollution':
                                    return {
                                      govt: 'MINISTRY OF ENVIRONMENT, FOREST & CLIMATE CHANGE',
                                      agency: 'Central Pollution Control Board (CPCB), India',
                                      type: 'POLLUTION UNDER CONTROL (PUC)',
                                      badge: 'CPCB',
                                      numberLabel: 'PUC SERIAL NUMBER',
                                      numberValue: 'PUC' + (v.reg ? v.reg.replace(/[^A-Z0-9]/g, '') : '9982'),
                                      photoIcon: 'eco'
                                    };
                                  case 'fitness':
                                    return {
                                      govt: 'REGIONAL TRANSPORT OFFICE (GOVT OF INDIA)',
                                      agency: 'Motor Vehicles Inspection Department',
                                      type: 'VEHICLE FITNESS CERTIFICATE',
                                      badge: 'RTO',
                                      numberLabel: 'FITNESS CERTIFICATE ID',
                                      numberValue: 'FIT' + (v._id ? v._id.slice(-8).toUpperCase() : '8744'),
                                      photoIcon: 'fact_check'
                                    };
                                  case 'permit':
                                    return {
                                      govt: 'STATE TRANSPORT AUTHORITY (ALL INDIA PERMIT)',
                                      agency: 'National Permits and Licensing Department',
                                      type: 'NATIONAL ROAD PERMIT (GOODS)',
                                      badge: 'STA',
                                      numberLabel: 'PERMIT REGISTRATION ID',
                                      numberValue: 'NP' + (v.reg ? v.reg.replace(/[^A-Z0-9]/g, '') : '4828'),
                                      photoIcon: 'map'
                                    };
                                  case 'tax':
                                    return {
                                      govt: 'DEPARTMENT OF REVENUE & MOTOR VEHICLES',
                                      agency: 'Commercial Vehicle Road Tax Authority',
                                      type: 'ROAD TAX LIFE-TIME RECEIPT',
                                      badge: 'TAX',
                                      numberLabel: 'TAX RECEIPT TRANSACTION NO',
                                      numberValue: 'TAX' + (v._id ? v._id.slice(-6).toUpperCase() : '8729'),
                                      photoIcon: 'receipt_long'
                                    };
                                  default:
                                    return {
                                      govt: 'GOVERNMENT OF INDIA',
                                      agency: 'National Transport Control Board',
                                      type: 'COMPLIANCE COMPONENT',
                                      badge: 'DOC',
                                      numberLabel: 'DOCUMENT CERTIFICATE ID',
                                      numberValue: v.reg || 'N/A',
                                      photoIcon: 'description'
                                    };
                                }
                              };

                              const gi = getGovtCardInfo(key, activeVeh);

                              // Spaced digits formatter
                              const formatCardNumber = (str) => {
                                if (!str) return 'N/A';
                                const clean = str.replace(/\s+/g, '').toUpperCase();
                                const chunks = [];
                                for (let i = 0; i < clean.length; i += 4) {
                                  chunks.push(clean.slice(i, i + 4));
                                }
                                return chunks.join('   ');
                              };

                              return (
                                <div key={key} className={`bg-white rounded-[32px] p-6 border-2 shadow-clayCard relative overflow-hidden transition-all duration-300 ${c.card}`}>
                                  {/* Govt Card Header */}
                                  <div className="flex justify-between items-start border-b pb-3 mb-4 border-slate-200/50">
                                    <div className="space-y-0.5 text-left">
                                      <h4 className={`text-[9px] font-black uppercase tracking-wider ${c.hdr}`} style={{ fontFamily: "Nunito, sans-serif" }}>{gi.govt}</h4>
                                      <h5 className={`text-[8px] font-extrabold tracking-wide ${c.sub}`} style={{ fontFamily: "Nunito, sans-serif" }}>{gi.agency}</h5>
                                    </div>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-[9px] shadow-clayCard ${c.badge}`}>
                                      {gi.badge}
                                    </div>
                                  </div>

                                  {doc?.expiryDate ? (
                                    <>
                                      {/* Govt Card Content Layout */}
                                      <div className="flex items-start gap-4 mb-4">
                                        {/* Left Side Photo/Verified Box */}
                                        <div className={`w-20 h-24 rounded-2xl border-2 flex flex-col items-center justify-center text-center p-2 shadow-clayPressed flex-shrink-0 ${c.photoBox}`}>
                                          <span className="material-symbols-outlined text-[28px] mb-1">{gi.photoIcon}</span>
                                          <span className="font-mono text-[6px] font-black tracking-widest uppercase leading-none">DOCUMENT VERIFIED</span>
                                        </div>

                                        {/* Right Side Key Fields */}
                                        <div className="flex-1 space-y-2 text-left pl-1">
                                          <div>
                                            <span className={`text-[8px] font-mono font-black uppercase tracking-wider block ${c.lbl}`}>DOCUMENT TYPE</span>
                                            <p className="font-headline font-black text-xs text-slate-800 uppercase" style={{ fontFamily: 'Nunito, sans-serif' }}>{gi.type}</p>
                                          </div>
                                          <div>
                                            <span className={`text-[8px] font-mono font-black uppercase tracking-wider block ${c.lbl}`}>VEHICLE DETAILS</span>
                                            <p className="font-bold text-[11px] text-slate-700 uppercase">{activeVeh.name} ({activeVeh.reg})</p>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            {doc.issueDate && (
                                              <div>
                                                <span className={`text-[8px] font-mono font-black uppercase tracking-wider block ${c.lbl}`}>ISSUE DATE</span>
                                                <p className="font-bold text-[11px] text-slate-700">{doc.issueDate}</p>
                                              </div>
                                            )}
                                            <div>
                                              <span className={`text-[8px] font-mono font-black uppercase tracking-wider block ${c.lbl}`}>EXPIRY DATE</span>
                                              <p className="font-bold text-[11px] text-slate-700">{doc.expiryDate}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Government Card Footer Divider & Number Placement */}
                                      <div className="border-t border-dashed pt-3 mt-3 border-slate-300">
                                        <div className="text-center">
                                          <span className={`text-[8px] font-mono font-black uppercase tracking-wider block ${c.lbl}`}>{gi.numberLabel}</span>
                                          <p className={`font-mono text-base font-black tracking-widest mt-1 uppercase ${c.spacedNum}`} style={{ letterSpacing: '3px' }}>
                                            {formatCardNumber(gi.numberValue)}
                                          </p>
                                        </div>
                                      </div>

                                      {/* View Document action button */}
                                      {doc.fileName && (
                                        <div className="mt-4">
                                          <a
                                            href={doc.fileName}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={`w-full text-center flex items-center justify-center gap-1.5 font-bold text-[10px] py-2.5 rounded-[16px] shadow-clayButton transition-all uppercase tracking-wider border cursor-pointer ${c.btn}`}
                                            style={{ fontFamily: 'Nunito, sans-serif' }}
                                          >
                                            <span className="material-symbols-outlined text-[13px]">visibility</span>
                                            <span>VIEW {gi.badge === 'UID' ? 'RC' : gi.badge} DOCUMENT</span>
                                          </a>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="py-8 text-center bg-white/40 rounded-2xl border border-dashed border-slate-200">
                                      <p className={`font-mono text-[9px] font-black uppercase tracking-wider opacity-60 ${c.hdr}`}>No compliance upload found</p>
                                      <p className="font-mono text-[8px] text-clay-muted mt-1">Submit documents in the vehicle details form</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* Trips Tab */
                          <div className="bg-white rounded-[32px] p-8 border border-white/60 shadow-clayCard space-y-6">
                            <h4 className="font-headline text-xl font-black uppercase text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Dispatched Trip Logs</h4>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                              {vehicleTrips.length === 0 ? (
                                <div className="text-center py-10 text-clay-muted">
                                  <Truck className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                  <p className="font-bold uppercase text-xs">No trip history for this vehicle.</p>
                                </div>
                              ) : (
                                vehicleTrips.map(t => (
                                  <div key={t._id} className="p-5 bg-clay-canvas/40 rounded-[24px] border border-white/60 shadow-clayCard hover:-translate-y-0.5 transition-all flex justify-between items-center">
                                    <div className="space-y-1">
                                      <div className="flex gap-2 items-center text-[10px] font-black text-clay-primary uppercase font-mono tracking-widest">
                                        <span>{t.id}</span><span>•</span><span>{t.distance} KM</span>
                                      </div>
                                      <h5 className="font-headline font-black text-sm uppercase text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                                        {t.source} ➜ {t.destination}
                                      </h5>
                                      {t.driver?.name && <p className="font-mono text-[9px] text-clay-muted font-bold">Driver: {t.driver.name}</p>}
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                      t.status === 'completed' ? 'bg-clay-success/15 text-clay-success' :
                                      t.status === 'dispatched' ? 'bg-clay-tertiary/15 text-clay-tertiary' : 'bg-slate-100 text-slate-500'
                                    }`}>{t.status}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* ── CARD GRID VIEW ── */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${selectedVehicle ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                {filteredVehicles.map(veh => (
                  <div
                    key={veh._id}
                    onClick={() => { setActiveVehicleProfileId(veh._id); setSelectedVehicle(veh); setVehicleDossierTab('documents'); }}
                    className={`bg-white rounded-[32px] p-6 shadow-clayCard border flex flex-col justify-between gap-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer border-white/60`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-headline font-black text-xl tracking-tight text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>
                          {veh.name}
                        </h4>
                        <span className="font-mono text-[10px] text-clay-muted font-bold uppercase tracking-widest mt-1 block">
                          {veh.reg}
                        </span>
                      </div>

                      <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${veh.status === 'available' ? 'bg-clay-success/15 text-clay-success' :
                          veh.status === 'on_trip' ? 'bg-clay-tertiary/15 text-clay-tertiary' :
                            veh.status === 'in_shop' ? 'bg-clay-secondary/15 text-clay-secondary' : 'bg-red-100 text-red-700'
                        }`}>
                        {veh.status === 'available' && 'Available'}
                        {veh.status === 'on_trip' && 'On Trip'}
                        {veh.status === 'in_shop' && 'In Shop'}
                        {veh.status === 'retired' && 'Retired'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <span className="font-mono text-[9px] text-clay-muted font-black uppercase tracking-wider">Classification</span>
                        <p className="font-bold text-xs text-clay-foreground mt-0.5">{veh.type}</p>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-clay-muted font-black uppercase tracking-wider">Capacity</span>
                        <p className="font-bold text-xs text-clay-foreground mt-0.5">{veh.maxLoad} Tons</p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-mono text-[9px] text-clay-muted font-black uppercase tracking-wider">Acquisition Cost</span>
                        <p className="font-bold text-xs text-clay-foreground mt-0.5">₹{veh.cost.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedVehicle && (
                <div className="bg-white rounded-[32px] p-8 border border-white/60 shadow-clayCard lg:col-span-4 space-y-6 relative overflow-y-auto max-h-[80vh]">
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="absolute right-4 top-4 text-clay-muted hover:text-clay-foreground p-1.5 bg-clay-canvas rounded-full shadow-clayCard hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="border-b border-slate-100 pb-4">
                    <span className="bg-clay-primary/10 text-clay-primary text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Specs & Diagnostics</span>
                    <h3 className="font-headline text-2xl font-black uppercase mt-2" style={{ fontFamily: "Nunito, sans-serif" }}>{selectedVehicle.name}</h3>
                    <p className="font-mono text-[10px] text-clay-muted font-bold uppercase mt-1 tracking-wider">{selectedVehicle.reg}</p>
                  </div>

                  <div className="bg-clay-canvas/40 p-5 rounded-[24px] border border-white/60 space-y-4 shadow-clayPressed text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-clay-muted">Odometer</span>
                      <span>{selectedVehicle.odometer} KM</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-clay-muted">Acquisition Cost</span>
                      <span>₹{selectedVehicle.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-clay-muted">Max Load Capacity</span>
                      <span>{selectedVehicle.maxLoad} Tons</span>
                    </div>
                    {selectedVehicle.nickname && (
                      <div className="flex justify-between font-bold">
                        <span className="text-clay-muted">Nickname</span>
                        <span>{selectedVehicle.nickname}</span>
                      </div>
                    )}
                    {selectedVehicle.brand && (
                      <div className="flex justify-between font-bold">
                        <span className="text-clay-muted">Brand / Model</span>
                        <span>{selectedVehicle.brand} {selectedVehicle.model}</span>
                      </div>
                    )}
                    {selectedVehicle.mfgYear && (
                      <div className="flex justify-between font-bold">
                        <span className="text-clay-muted">Mfg Year / Color</span>
                        <span>{selectedVehicle.mfgYear} / {selectedVehicle.color}</span>
                      </div>
                    )}
                    {selectedVehicle.vin && (
                      <div className="flex justify-between font-bold">
                        <span className="text-clay-muted">VIN</span>
                        <span className="font-mono text-[10px]">{selectedVehicle.vin}</span>
                      </div>
                    )}
                    {selectedVehicle.engineNum && (
                      <div className="flex justify-between font-bold">
                        <span className="text-clay-muted">Engine No</span>
                        <span className="font-mono text-[10px]">{selectedVehicle.engineNum}</span>
                      </div>
                    )}
                    {selectedVehicle.seatingCapacity && (
                      <div className="flex justify-between font-bold">
                        <span className="text-clay-muted">Seating Capacity</span>
                        <span>{selectedVehicle.seatingCapacity} seats</span>
                      </div>
                    )}
                    {selectedVehicle.cargoCapacity && (
                      <div className="flex justify-between font-bold">
                        <span className="text-clay-muted">Cargo Capacity</span>
                        <span>{selectedVehicle.cargoCapacity}</span>
                      </div>
                    )}
                    {selectedVehicle.fuelTankCapacity && (
                      <div className="flex justify-between font-bold">
                        <span className="text-clay-muted">Fuel Capacity</span>
                        <span>{selectedVehicle.fuelTankCapacity} L</span>
                      </div>
                    )}
                    {selectedVehicle.ownerName && (
                      <div className="flex justify-between font-bold border-t border-slate-200/50 pt-2">
                        <span className="text-clay-muted">Owner Name</span>
                        <span>{selectedVehicle.ownerName} ({selectedVehicle.leaseType})</span>
                      </div>
                    )}
                    {selectedVehicle.purchaseDate && (
                      <div className="flex justify-between font-bold">
                        <span className="text-clay-muted">Purchased</span>
                        <span>{selectedVehicle.purchaseDate} (₹{Number(selectedVehicle.purchaseCost).toLocaleString()})</span>
                      </div>
                    )}
                    {selectedVehicle.warrantyExpiry && (
                      <div className="flex justify-between font-bold">
                        <span className="text-clay-muted">Warranty Expiry</span>
                        <span>{selectedVehicle.warrantyExpiry}</span>
                      </div>
                    )}

                    {/* Status & Location Section */}
                    <div className="border-t border-slate-200/50 pt-3 space-y-2 text-left">
                      <span className="font-mono text-[9px] text-[#8B5CF6] font-black uppercase tracking-wider block mb-1">Status & Location</span>
                      <div className="flex justify-between font-bold">
                        <span className="text-clay-muted">Current Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-extrabold ${selectedVehicle.status === 'available' ? 'bg-emerald-100 text-emerald-600' :
                            selectedVehicle.status === 'on_trip' ? 'bg-sky-100 text-sky-600' :
                              selectedVehicle.status === 'reserved' ? 'bg-amber-100 text-amber-600' :
                                selectedVehicle.status === 'maintenance' ? 'bg-rose-100 text-rose-600 animate-pulse' :
                                  selectedVehicle.status === 'inactive' ? 'bg-slate-100 text-slate-600' :
                                    'bg-red-100 text-red-600'
                          }`}>
                          {selectedVehicle.status || 'Available'}
                        </span>
                      </div>
                      {selectedVehicle.assignedDriver && (
                        <div className="flex justify-between font-bold">
                          <span className="text-clay-muted">Assigned Driver</span>
                          <span>{selectedVehicle.assignedDriver.name || 'Unassigned'}</span>
                        </div>
                      )}
                      {selectedVehicle.depotLocation && (
                        <div className="flex justify-between font-bold">
                          <span className="text-clay-muted">Depot Location</span>
                          <span>{selectedVehicle.depotLocation}</span>
                        </div>
                      )}
                      {selectedVehicle.lastUpdated && (
                        <div className="flex justify-between font-bold">
                          <span className="text-clay-muted">Last Updated</span>
                          <span>{new Date(selectedVehicle.lastUpdated).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Fuel Details Section */}
                    {(selectedVehicle.fuelType || selectedVehicle.fuelCardNumber || selectedVehicle.mileage || selectedVehicle.avgMonthlyFuelConsumption) && (
                      <div className="border-t border-slate-200/50 pt-3 space-y-2 text-left">
                        <span className="font-mono text-[9px] text-[#8B5CF6] font-black uppercase tracking-wider block mb-1">Fuel Information</span>
                        <div className="flex justify-between font-bold">
                          <span className="text-clay-muted">Fuel Type</span>
                          <span>{selectedVehicle.fuelType || 'Diesel'}</span>
                        </div>
                        {selectedVehicle.fuelCardNumber && (
                          <div className="flex justify-between font-bold">
                            <span className="text-clay-muted">Fuel Card No.</span>
                            <span className="font-mono">{selectedVehicle.fuelCardNumber}</span>
                          </div>
                        )}
                        {selectedVehicle.mileage && (
                          <div className="flex justify-between font-bold">
                            <span className="text-clay-muted">Mileage</span>
                            <span>{selectedVehicle.mileage} KM/L</span>
                          </div>
                        )}
                        {selectedVehicle.avgMonthlyFuelConsumption && (
                          <div className="flex justify-between font-bold">
                            <span className="text-clay-muted">Avg Monthly Usage</span>
                            <span>{selectedVehicle.avgMonthlyFuelConsumption} Liters</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Insurance Policy Section */}
                    {selectedVehicle.insurance?.company && (
                      <div className="border-t border-slate-200/50 pt-3 space-y-2 text-left">
                        <span className="font-mono text-[9px] text-[#8B5CF6] font-black uppercase tracking-wider block mb-1">Insurance Information</span>
                        <div className="flex justify-between font-bold">
                          <span className="text-clay-muted">Insurance Company</span>
                          <span>{selectedVehicle.insurance.company}</span>
                        </div>
                        {selectedVehicle.insurance.policyNumber && (
                          <div className="flex justify-between font-bold">
                            <span className="text-clay-muted">Policy No.</span>
                            <span className="font-mono">{selectedVehicle.insurance.policyNumber}</span>
                          </div>
                        )}
                        {selectedVehicle.insurance.coverageAmount && (
                          <div className="flex justify-between font-bold">
                            <span className="text-clay-muted">Coverage Amount</span>
                            <span>₹{Number(selectedVehicle.insurance.coverageAmount).toLocaleString()}</span>
                          </div>
                        )}
                        {selectedVehicle.insurance.startDate && (
                          <div className="flex justify-between font-bold">
                            <span className="text-clay-muted">Duration</span>
                            <span>{selectedVehicle.insurance.startDate} to {selectedVehicle.insurance.expiryDate}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Uploaded Documents Section */}
                    {selectedVehicle.documents && (
                      <div className="border-t border-slate-200/50 pt-3 space-y-2 text-left">
                        <span className="font-mono text-[9px] text-[#8B5CF6] font-black uppercase tracking-wider block mb-1">Compliance Documents</span>
                        <div className="space-y-2 text-[11px]">
                          {[
                            { label: 'RC (Registration)', doc: selectedVehicle.documents.rc },
                            { label: 'Insurance Policy', doc: selectedVehicle.documents.insurance },
                            { label: 'Pollution Certificate (PUC)', doc: selectedVehicle.documents.pollution },
                            { label: 'Fitness Certificate', doc: selectedVehicle.documents.fitness },
                            { label: 'Road Permit', doc: selectedVehicle.documents.permit },
                            { label: 'Tax Receipt', doc: selectedVehicle.documents.tax }
                          ].map((item) => {
                            if (!item.doc || !item.doc.expiryDate) return null;
                            const statusBadge = getDocStatus(item.doc.expiryDate);
                            return (
                              <div key={item.label} className="p-2.5 bg-clay-canvas/60 rounded-xl border border-white/60 space-y-1 shadow-clayCard">
                                <div className="flex justify-between items-center font-bold">
                                  <span className="text-clay-foreground">{item.label}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-extrabold ${statusBadge.color}`}>
                                    {statusBadge.label}
                                  </span>
                                </div>
                                <div className="text-[10px] text-clay-muted font-semibold">
                                  {item.doc.fileName && <div>File: <span className="font-mono text-clay-foreground font-bold">{item.doc.fileName}</span></div>}
                                  <div>Validity: <span className="text-clay-foreground font-bold">{item.doc.issueDate || 'N/A'}</span> to <span className="text-clay-foreground font-bold">{item.doc.expiryDate}</span></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GPS & Live Tracking Section */}
                  <GPSCard vehicle={selectedVehicle} />

                  {/* Red claymorphic Delete Vehicle Button */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col space-y-3">
                    <button
                      onClick={() => handleDeleteVehicle(selectedVehicle._id)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-red-400 to-rose-600 text-white font-headline text-xs font-bold uppercase tracking-wider py-3.5 rounded-[20px] shadow-clayButton hover:shadow-[14px_14px_28px_rgba(239,68,68,0.35)] active:scale-[0.95] active:shadow-clayPressed transition-all duration-300 cursor-pointer"
                      style={{ fontFamily: "Nunito, sans-serif" }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Vehicle</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        }
      </div>
    )}

        {/* ========================================================
           TAB 3: DRIVER MANAGEMENT
           ======================================================== */}
        {activeMenu === 'drivers' && (
          <div className="space-y-8 animate-fade-in">
            {activeDriverProfileId && drivers.find(d => d._id === activeDriverProfileId) ? (
              (() => {
                const activeDrv = drivers.find(d => d._id === activeDriverProfileId);
                const currentTrip = trips.find(t => t.driver?._id.toString() === activeDrv._id.toString() && t.status === 'dispatched');
                const driverTrips = trips.filter(t => t.driver?._id.toString() === activeDrv._id.toString());
                const daysLeft = Math.ceil((new Date(activeDrv.expiry) - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div className="space-y-8">
                    {/* Header Dossier Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 p-5 rounded-[28px] border border-white/40 shadow-clayCard">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => { setActiveDriverProfileId(null); setSelectedDriver(null); }}
                          className="p-3 bg-white border border-white/60 text-clay-primary rounded-[20px] shadow-clayCard hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <label className="relative group cursor-pointer block">
                          {activeDrv.avatar ? (
                            <img src={activeDrv.avatar} alt={activeDrv.name} className="w-14 h-14 rounded-full object-cover shadow-clayCard border-2 border-clay-primary/20" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-clay-primary/20 flex items-center justify-center font-bold text-clay-primary text-xl shadow-clayCard">
                              {activeDrv.name[0].toUpperCase()}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-lg">photo_camera</span>
                          </div>
                          {/* Floating safety score badge in the profile picture */}
                          <div className={`absolute -bottom-1 -right-1 min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center font-mono text-[9px] font-black text-white border-2 border-white shadow-clayCard ${activeDrv.score >= 90 ? 'bg-clay-success' :
                              activeDrv.score >= 75 ? 'bg-amber-500' : 'bg-red-500'
                            }`} title={`Safety Score: ${activeDrv.score}%`}>
                            {activeDrv.score}%
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setUploading(true);
                            try {
                              const url = await uploadToImageKit(file, `avatar_${activeDrv._id}`);
                              await fetch(`/api/drivers/${activeDrv._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ avatar: url })
                              });
                              fetchData();
                            } catch (err) { alert('Upload failed: ' + err.message); }
                            setUploading(false);
                          }} />
                        </label>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="font-headline text-3xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>
                              {activeDrv.name}
                            </h2>
                            <span className={`px-3.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${activeDrv.status === 'available' ? 'bg-clay-success/15 text-clay-success' :
                                activeDrv.status === 'on_trip' ? 'bg-clay-tertiary/15 text-clay-tertiary' :
                                  activeDrv.status === 'off_duty' ? 'bg-clay-muted/15 text-clay-muted' : 'bg-red-100 text-red-700'
                              }`}>
                              {activeDrv.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-clay-muted font-bold uppercase tracking-wider mt-1">Indian Fleet Driver Dossier Profile</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEditDriver(activeDrv)}
                          className="bg-white text-clay-primary border border-white/60 font-bold text-xs px-5 py-3.5 rounded-[20px] shadow-clayCard hover:-translate-y-0.5 active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                          style={{ fontFamily: "Nunito, sans-serif" }}
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(activeDrv._id)}
                          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs px-5 py-3.5 rounded-[20px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                          style={{ fontFamily: "Nunito, sans-serif" }}
                        >
                          Delete Profile
                        </button>
                      </div>
                    </div>

                    {/* Dossier Alert Warning Bar */}
                    {daysLeft < 0 ? (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-[24px] flex items-center gap-3 shadow-clayCard animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="font-mono text-xs font-black uppercase text-red-700">LICENSE EXPIRED! This driver license expired on {new Date(activeDrv.expiry).toLocaleDateString()}. Please replace immediately.</span>
                      </div>
                    ) : daysLeft <= 30 ? (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-[24px] flex items-center gap-3 shadow-clayCard">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <span className="font-mono text-xs font-black uppercase text-yellow-700">LICENSE EXPIRES IN {daysLeft} DAYS! Request renewal document verification.</span>
                      </div>
                    ) : null}

                    {/* Split dossier layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                      {/* LEFT Dossier Info Panel */}
                      <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white rounded-[32px] p-8 border border-white/60 shadow-clayCard space-y-6">
                          <div className="flex gap-4 items-center border-b border-slate-100 pb-5">
                            <div className="relative">
                              {activeDrv.avatar ? (
                                <img src={activeDrv.avatar} alt={activeDrv.name} className="w-16 h-16 rounded-full object-cover shadow-clayCard border-2 border-clay-primary/20" />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-clay-primary/20 flex items-center justify-center font-bold text-clay-primary text-2xl shadow-clayCard">
                                  {activeDrv.name[0].toUpperCase()}
                                </div>
                              )}
                              {/* Floating safety score badge in the profile picture */}
                              <div className={`absolute -bottom-1 -right-1 min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center font-mono text-[9px] font-black text-white border-2 border-white shadow-clayCard ${activeDrv.score >= 90 ? 'bg-clay-success' :
                                  activeDrv.score >= 75 ? 'bg-amber-500' : 'bg-red-500'
                                }`} title={`Safety Score: ${activeDrv.score}%`}>
                                {activeDrv.score}%
                              </div>
                            </div>
                            <div>
                              <h4 className="font-headline font-black text-xl text-clay-foreground uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>{activeDrv.name}</h4>
                              <p className="font-mono text-[9px] text-clay-muted font-bold uppercase tracking-widest mt-0.5">Blood Group: {activeDrv.bloodGroup || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="space-y-4 text-xs font-bold">
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                              <span className="text-clay-muted uppercase">Phone Contact</span>
                              <span>{activeDrv.contact}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                              <span className="text-clay-muted uppercase">Email Address</span>
                              <span className="lowercase">{activeDrv.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                              <span className="text-clay-muted uppercase">RTO Class License</span>
                              <span>{activeDrv.category}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                              <span className="text-clay-muted uppercase">Verification Status</span>
                              <span className="uppercase text-clay-primary">{activeDrv.status}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-clay-muted uppercase">Address Details</span>
                              <p className="font-medium text-clay-foreground leading-normal mt-0.5">{activeDrv.address || 'No residential address verified.'}</p>
                            </div>
                          </div>

                          {/* Safety score Progress ring */}
                          <div className="bg-clay-canvas/50 p-6 rounded-[24px] border border-white/80 shadow-clayPressed flex justify-between items-center gap-4">
                            <div>
                              <span className="font-mono text-[9px] text-clay-muted font-black uppercase tracking-wider block">Safety Score Rating</span>
                              <p className="font-bold text-xs text-clay-muted mt-1 leading-normal uppercase">Calculated based on speed compliance & accident log history.</p>
                            </div>
                            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-clayCard relative">
                              <svg className="w-full h-full transform -rotate-90">
                                {/* Background circle (grey) */}
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="24"
                                  stroke="#E2E8F0"
                                  strokeWidth="5"
                                  fill="none"
                                />
                                {/* Foreground progress circle (blue) */}
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="24"
                                  stroke="#3B82F6"
                                  strokeWidth="5"
                                  fill="none"
                                  strokeDasharray={2 * Math.PI * 24}
                                  strokeDashoffset={2 * Math.PI * 24 * (1 - activeDrv.score / 100)}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute font-mono text-xs font-black text-blue-600">{activeDrv.score}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Current Active Trip panel */}
                        <div className="bg-white rounded-[32px] p-8 border border-white/60 shadow-clayCard space-y-6">
                          <h4 className="font-headline text-lg font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Current route assignment</h4>
                          {currentTrip ? (
                            <div className="space-y-4">
                              <div className="bg-clay-canvas/50 p-5 rounded-[24px] border border-white/60 space-y-2.5">
                                <div className="flex justify-between text-[10px] font-black text-clay-primary uppercase font-mono tracking-widest">
                                  <span>{currentTrip.id}</span>
                                  <span>In Transit</span>
                                </div>
                                <h5 className="font-headline font-black text-base uppercase text-clay-foreground mt-1" style={{ fontFamily: "Nunito, sans-serif" }}>
                                  {currentTrip.source} ➜ {currentTrip.destination}
                                </h5>
                                <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-100 mt-2 text-clay-muted">
                                  <span>Cargo Load: {currentTrip.weight}T</span>
                                  <span>Distance: {currentTrip.distance} KM</span>
                                </div>
                              </div>
                              <div className="relative pt-1">
                                <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-[#EFEBF5] shadow-inner">
                                  <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-clay-primary w-2/3 transition-all duration-500"></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-mono font-bold text-clay-muted uppercase mt-1.5 tracking-wider">
                                  <span>Dispatched</span>
                                  <span>Estimated Arrival (66%)</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6 text-clay-muted space-y-2">
                              <span className="material-symbols-outlined text-4xl text-slate-300">route</span>
                              <p className="font-mono text-[9px] font-black uppercase tracking-wider block">No active transit route assigned</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* RIGHT Cards Overlay & Tabs Panel */}
                      <div className="lg:col-span-7 space-y-8">
                        {/* Tab Toggle buttons */}
                        <div className="flex bg-white/40 p-2 rounded-[20px] border border-white/40 shadow-clayCard">
                          <button
                            onClick={() => setDossierTab('documents')}
                            className={`flex-1 py-3.5 text-xs font-black rounded-[16px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${dossierTab === 'documents' ? 'bg-white text-clay-primary shadow-clayCard' : 'text-clay-muted hover:text-clay-primary'
                              }`}
                            style={{ fontFamily: "Nunito, sans-serif" }}
                          >
                            Government Documents
                          </button>
                          <button
                            onClick={() => setDossierTab('trips')}
                            className={`flex-1 py-3.5 text-xs font-black rounded-[16px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${dossierTab === 'trips' ? 'bg-white text-clay-primary shadow-clayCard' : 'text-clay-muted hover:text-clay-primary'
                              }`}
                            style={{ fontFamily: "Nunito, sans-serif" }}
                          >
                            Dispatch History ({driverTrips.length})
                          </button>
                        </div>

                        {/* Government smart cards visual mockups */}
                        {dossierTab === 'documents' ? (
                          <div className="space-y-8">

                            {/* Aadhaar Card Mockup */}
                            <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 rounded-[32px] p-8 border-2 border-emerald-100 shadow-clayCard relative overflow-hidden group">
                              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                              {/* Indian emblem mock */}
                              <div className="flex justify-between items-start border-b border-emerald-100 pb-4 mb-5">
                                <div className="space-y-0.5">
                                  <h4 className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Bharat Sarkar (Govt of India)</h4>
                                  <h5 className="text-[9px] font-bold text-emerald-700 tracking-wide">Unique Identification Authority of India (UIDAI)</h5>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold text-[8px]">UID</div>
                              </div>

                              <div className="flex gap-6 items-center">
                                <div className="w-24 h-28 bg-emerald-500/15 border border-emerald-200/50 rounded-2xl flex flex-col items-center justify-center text-emerald-700 font-bold shadow-inner">
                                  <span className="material-symbols-outlined text-4xl">account_box</span>
                                  <span className="text-[8px] uppercase tracking-wider mt-1">Photo verified</span>
                                </div>

                                <div className="space-y-3 flex-1 text-xs">
                                  <div>
                                    <span className="text-[9px] text-emerald-600/70 font-mono font-bold uppercase tracking-wider block">Full Name</span>
                                    <p className="font-black text-slate-800 uppercase">{activeDrv.name}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-emerald-600/70 font-mono font-bold uppercase tracking-wider block">Birth Year / Gender</span>
                                    <p className="font-bold text-slate-700">Male</p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-emerald-100/50 text-center">
                                <span className="text-[8px] text-emerald-600/70 font-mono font-bold uppercase tracking-wider block mb-1">Aadhaar Number</span>
                                <h3 className="font-mono text-xl font-black tracking-[0.25em] text-slate-800">
                                  {activeDrv.aadhaar ? activeDrv.aadhaar.replace(/(\d{4})/g, '$1 ').trim() : 'XXXX XXXX XXXX'}
                                </h3>
                              </div>
                              <div className="mt-4 flex justify-center">
                                {activeDrv.aadhaarFile ? (
                                  <a href={activeDrv.aadhaarFile} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] px-5 py-2.5 rounded-full shadow-clayCard transition-all uppercase tracking-wider cursor-pointer">
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                    View Aadhaar Document
                                  </a>
                                ) : (
                                  <label className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] px-5 py-2.5 rounded-full shadow-clayCard transition-all uppercase tracking-wider cursor-pointer border border-emerald-200">
                                    <span className="material-symbols-outlined text-sm">upload_file</span>
                                    {uploading ? 'Uploading...' : 'Upload Aadhaar PDF'}
                                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      setUploading(true);
                                      try {
                                        const url = await uploadToImageKit(file, `aadhaar_${activeDrv._id}`);
                                        await fetch(`/api/drivers/${activeDrv._id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                          body: JSON.stringify({ aadhaarFile: url })
                                        });
                                        fetchData();
                                      } catch (err) { alert('Upload failed: ' + err.message); }
                                      setUploading(false);
                                    }} />
                                  </label>
                                )}
                              </div>
                            </div>

                            {/* Driving License Mockup */}
                            <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/30 rounded-[32px] p-8 border-2 border-amber-100 shadow-clayCard relative overflow-hidden group">
                              <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                              <div className="flex justify-between items-start border-b border-amber-100 pb-4 mb-5">
                                <div className="space-y-0.5">
                                  <h4 className="text-[10px] font-black uppercase text-amber-800 tracking-wider">INDIAN UNION DRIVING LICENSE</h4>
                                  <h5 className="text-[9px] font-bold text-amber-700 tracking-wide">Transport Department / RTO Registry</h5>
                                </div>
                                <span className="material-symbols-outlined text-amber-600 text-2xl">badge</span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-[9px] text-amber-600/70 font-mono font-bold uppercase tracking-wider block">License Number</span>
                                  <p className="font-black text-slate-800 font-mono tracking-widest">{activeDrv.license}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] text-amber-600/70 font-mono font-bold uppercase tracking-wider block">RTO Vehicle Class</span>
                                  <p className="font-black text-amber-700 uppercase">{activeDrv.category}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] text-amber-600/70 font-mono font-bold uppercase tracking-wider block">Authority Badge</span>
                                  <p className="font-bold text-slate-700 uppercase">TRANS VEHICLE ONLY</p>
                                </div>
                                <div>
                                  <span className="text-[9px] text-amber-600/70 font-mono font-bold uppercase tracking-wider block">Expiry Date</span>
                                  <p className={`font-bold ${daysLeft < 0 ? 'text-red-600 font-black animate-pulse' : 'text-slate-700'}`}>
                                    {new Date(activeDrv.expiry).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-center">
                                {activeDrv.dlFile ? (
                                  <a href={activeDrv.dlFile} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[10px] px-5 py-2.5 rounded-full shadow-clayCard transition-all uppercase tracking-wider cursor-pointer">
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                    View DL Document
                                  </a>
                                ) : (
                                  <label className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] px-5 py-2.5 rounded-full shadow-clayCard transition-all uppercase tracking-wider cursor-pointer border border-amber-200">
                                    <span className="material-symbols-outlined text-sm">upload_file</span>
                                    {uploading ? 'Uploading...' : 'Upload DL PDF'}
                                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      setUploading(true);
                                      try {
                                        const url = await uploadToImageKit(file, `dl_${activeDrv._id}`);
                                        await fetch(`/api/drivers/${activeDrv._id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                          body: JSON.stringify({ dlFile: url })
                                        });
                                        fetchData();
                                      } catch (err) { alert('Upload failed: ' + err.message); }
                                      setUploading(false);
                                    }} />
                                  </label>
                                )}
                              </div>
                            </div>

                            {/* PAN Card Mockup */}
                            <div className="bg-gradient-to-br from-sky-50 via-white to-sky-50/30 rounded-[32px] p-8 border-2 border-sky-100 shadow-clayCard relative overflow-hidden group">
                              <div className="absolute right-0 top-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                              <div className="flex justify-between items-start border-b border-sky-100 pb-4 mb-5">
                                <div className="space-y-0.5">
                                  <h4 className="text-[10px] font-black uppercase text-sky-800 tracking-wider">Income Tax Department, Government of India</h4>
                                  <h5 className="text-[9px] font-bold text-sky-700 tracking-wide">Permanent Account Number (PAN) Card</h5>
                                </div>
                                <span className="material-symbols-outlined text-sky-600 text-2xl">credit_card</span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                                <div>
                                  <span className="text-[9px] text-sky-600/70 font-mono font-bold uppercase tracking-wider block">Cardholder Name</span>
                                  <p className="font-black text-slate-800 uppercase">{activeDrv.name}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] text-sky-600/70 font-mono font-bold uppercase tracking-wider block">Identity Verified</span>
                                  <p className="font-bold text-slate-700 uppercase">Govt of India</p>
                                </div>
                              </div>

                              <div className="mt-4 pt-4 border-t border-sky-100/50 text-center">
                                <span className="text-[8px] text-sky-600/70 font-mono font-bold uppercase tracking-wider block mb-1">PAN Code</span>
                                <h3 className="font-mono text-xl font-black tracking-[0.25em] text-slate-800">
                                  {activeDrv.pan ? activeDrv.pan.toUpperCase() : 'ABCDE1234F'}
                                </h3>
                              </div>
                              <div className="mt-4 flex justify-center">
                                {activeDrv.panFile ? (
                                  <a href={activeDrv.panFile} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-[10px] px-5 py-2.5 rounded-full shadow-clayCard transition-all uppercase tracking-wider cursor-pointer">
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                    View PAN Document
                                  </a>
                                ) : (
                                  <label className="inline-flex items-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[10px] px-5 py-2.5 rounded-full shadow-clayCard transition-all uppercase tracking-wider cursor-pointer border border-sky-200">
                                    <span className="material-symbols-outlined text-sm">upload_file</span>
                                    {uploading ? 'Uploading...' : 'Upload PAN PDF'}
                                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      setUploading(true);
                                      try {
                                        const url = await uploadToImageKit(file, `pan_${activeDrv._id}`);
                                        await fetch(`/api/drivers/${activeDrv._id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                          body: JSON.stringify({ panFile: url })
                                        });
                                        fetchData();
                                      } catch (err) { alert('Upload failed: ' + err.message); }
                                      setUploading(false);
                                    }} />
                                  </label>
                                )}
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="bg-white rounded-[32px] p-8 border border-white/60 shadow-clayCard space-y-6">
                            <h4 className="font-headline text-xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Recent Dispatched logs</h4>
                            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                              {driverTrips.length === 0 ? (
                                <div className="text-center py-10 text-clay-muted">
                                  <p className="font-bold uppercase text-xs">No dispatch history logged for driver.</p>
                                </div>
                              ) : (
                                driverTrips.map(t => (
                                  <div key={t._id} className="p-5 bg-clay-canvas/40 rounded-[24px] border border-white/60 shadow-clayCard hover:-translate-y-0.5 transition-all flex justify-between items-center">
                                    <div className="space-y-1">
                                      <div className="flex gap-2 items-center text-[10px] font-black text-clay-primary uppercase font-mono tracking-widest">
                                        <span>{t.id}</span>
                                        <span>•</span>
                                        <span>{t.distance} KM</span>
                                      </div>
                                      <h5 className="font-headline font-black text-sm uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>
                                        {t.source} ➜ {t.destination}
                                      </h5>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${t.status === 'completed' ? 'bg-clay-success/15 text-clay-success' :
                                        t.status === 'dispatched' ? 'bg-clay-tertiary/15 text-clay-tertiary' : 'bg-slate-100 text-slate-500'
                                      }`}>{t.status}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                      </div>

                    </div>
                  </div>
                );
              })()
            ) : (
              // Else render the Crew List grid view
              <div className="space-y-8">
                <div className="flex justify-between items-center bg-white/40 p-4 rounded-[24px] border border-white/40 shadow-clayCard">
                  <div className="relative w-full max-w-xs">
                    <input
                      type="text"
                      placeholder="Search driver by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-5 py-3.5 pr-12 rounded-[20px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs placeholder-clay-muted"
                    />
                    <Search className="absolute right-4 top-3.5 w-4 h-4 text-clay-muted" />
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-white border border-white/60 text-clay-muted font-bold text-xs px-4 py-3.5 rounded-[20px] shadow-clayCard focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="available">Available</option>
                      <option value="on_trip">On Trip</option>
                      <option value="suspended">Suspended</option>
                      <option value="off_duty">Off Duty</option>
                    </select>

                    <button
                      onClick={() => { setSubmitError(''); setShowAddDriver(true); }}
                      className="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-bold text-xs px-5 py-3.5 rounded-[20px] shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer"
                      style={{ fontFamily: "Nunito, sans-serif" }}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Driver</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDrivers.map(drv => (
                    <div
                      key={drv._id}
                      onClick={() => { setSelectedDriver(drv); setActiveDriverProfileId(drv._id); }}
                      className="bg-white rounded-[32px] p-6 shadow-clayCard border border-white/60 flex flex-col justify-between gap-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                          <div className="relative">
                            {drv.avatar ? (
                              <img src={drv.avatar} alt={drv.name} className="w-12 h-12 rounded-full object-cover shadow-clayCard border border-slate-100" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-clay-primary/20 flex items-center justify-center font-bold text-clay-primary shadow-clayCard text-lg">
                                {drv.name[0].toUpperCase()}
                              </div>
                            )}
                            {/* Floating safety score badge in the profile picture */}
                            <div className={`absolute -bottom-1 -right-1 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center font-mono text-[8px] font-black text-white border border-white shadow-md ${drv.score >= 90 ? 'bg-clay-success' :
                                drv.score >= 75 ? 'bg-amber-500' : 'bg-red-500'
                              }`} title={`Safety Score: ${drv.score}%`}>
                              {drv.score}%
                            </div>
                          </div>
                          <div>
                            <h4 className="font-headline font-black text-lg text-clay-foreground uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>
                              {drv.name}
                            </h4>
                            <span className="font-mono text-[9px] text-clay-muted font-bold uppercase tracking-wider block">
                              LIC: {drv.license} ({drv.category})
                            </span>
                          </div>
                        </div>

                        <span className={`px-3.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${drv.status === 'available' ? 'bg-clay-success/15 text-clay-success' :
                            drv.status === 'on_trip' ? 'bg-clay-tertiary/15 text-clay-tertiary' :
                              drv.status === 'off_duty' ? 'bg-clay-muted/15 text-clay-muted' : 'bg-red-100 text-red-700'
                          }`}>
                          {drv.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                        <div>
                          <span className="font-mono text-[9px] text-clay-muted font-black uppercase tracking-wider">License Expiry</span>
                          <p className={`font-bold text-xs mt-0.5 ${new Date(drv.expiry) < new Date() ? 'text-red-600 font-black animate-pulse' : 'text-clay-foreground'}`}>
                            {new Date(drv.expiry).toLocaleDateString()} {new Date(drv.expiry) < new Date() ? '(Expired)' : ''}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-[9px] text-clay-muted font-black uppercase tracking-wider block">Safety Rating</span>
                          <span className="font-mono text-xs font-black text-clay-primary mt-0.5 block">{drv.score}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
           TAB 4: DISPATCH LOG (TRIP MANAGEMENT)
           ======================================================== */}
        {activeMenu === 'schedule' && (
          <div className="space-y-8">
            <div className="bg-white rounded-[32px] p-8 shadow-clayCard border border-white/60 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Platform Dispatch log</h3>
                <button
                  onClick={() => { setSubmitError(''); setShowDispatchTrip(true); }}
                  className="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-bold text-xs px-5 py-3 rounded-[20px] shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Dispatch Trip</span>
                </button>
              </div>

              <div className="space-y-6">
                {trips.map(trip => (
                  <div key={trip._id} className="p-6 bg-clay-canvas/20 rounded-[28px] border border-white/80 shadow-clayCard flex flex-col lg:flex-row justify-between gap-6 hover:-translate-y-0.5 transition-all">
                    <div className="max-w-xs space-y-1">
                      <div className="flex gap-2 items-center">
                        <span className="font-mono text-xs font-black text-clay-primary uppercase tracking-widest">{trip.id}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-clay-muted"></span>
                        <span className="font-mono text-[9px] font-bold text-clay-muted uppercase truncate tracking-wider">{trip.driver?.name || 'No Driver'}</span>
                      </div>
                      <h4 className="font-headline font-black text-base text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>
                        {trip.source} ➜ {trip.destination}
                      </h4>
                      <p className="text-[10px] text-clay-muted font-bold uppercase tracking-wider">VEHICLE: {trip.vehicle ? `${trip.vehicle.name} (${trip.vehicle.reg})` : 'No Vehicle'}</p>
                      <p className="text-[10px] text-clay-muted font-bold uppercase tracking-wider">
                        WEIGHT: {trip.weight} Tons | PLANNED: {trip.distance} KM
                      </p>
                      {(trip.actualDistance > 0 || trip.status === 'completed') && (
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                          ACTUAL: {trip.actualDistance || trip.distance} KM
                        </p>
                      )}
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                        TOTAL TRIP COST: ₹{trip.revenue?.toLocaleString() || 0}
                      </p>
                      <p className="text-[10px] text-violet-600 font-bold uppercase tracking-wider">
                        DRIVER SALARY: ₹{trip.driverSalary?.toLocaleString() || 0}
                      </p>
                      <div className="flex gap-2.5 text-[9px] font-mono font-bold text-amber-700 uppercase tracking-wide mt-1 bg-amber-50/50 p-2 rounded-xl border border-amber-100/50">
                        <span>Fuel Est: ₹{trip.estimatedFuelCost || 0}</span>
                        <span>•</span>
                        <span>Fuel Act: ₹{trip.actualFuelCost || 0}</span>
                      </div>
                    </div>

                    <div className="flex-1 max-w-lg flex items-center justify-between gap-2.5 relative">
                      {[
                        { label: 'Draft', val: 'draft' },
                        { label: 'Dispatched', val: 'dispatched' },
                        { label: 'In Transit', val: 'in_transit' },
                        { label: 'Completed', val: 'completed' }
                      ].map((step, idx) => {
                        const stages = ['draft', 'dispatched', 'in_transit', 'completed', 'cancelled'];
                        const activeIndex = stages.indexOf(trip.status);
                        const selfIndex = stages.indexOf(step.val);
                        const isDone = selfIndex <= activeIndex;
                        const isCurrent = selfIndex === activeIndex;

                        return (
                          <div key={step.val} className="flex-1 flex flex-col items-center relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black shadow-clayCard transition-all ${isDone ? 'bg-clay-primary text-white' : 'bg-white text-clay-muted'
                              } ${isCurrent ? 'ring-4 ring-clay-primary/20 scale-110' : ''}`}>
                              {isDone && selfIndex < activeIndex ? (
                                <Check className="w-4 h-4 font-bold" />
                              ) : (
                                <span className="font-mono text-xs font-black">{idx + 1}</span>
                              )}
                            </div>
                            <span className="font-mono text-[8px] font-bold text-clay-muted uppercase mt-2 tracking-wider">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {trip.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleProgressTrip(trip._id, 'dispatched')}
                            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs px-3.5 py-2 rounded-[16px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                            style={{ fontFamily: "Nunito, sans-serif" }}
                          >
                            Dispatch
                          </button>
                          <button
                            onClick={() => handleProgressTrip(trip._id, 'in_transit')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-[16px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                            style={{ fontFamily: "Nunito, sans-serif" }}
                          >
                            Start Transit
                          </button>
                        </>
                      )}

                      {trip.status === 'dispatched' && (
                        <>
                          <button
                            onClick={() => handleProgressTrip(trip._id, 'in_transit')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-[16px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                            style={{ fontFamily: "Nunito, sans-serif" }}
                          >
                            Start Transit
                          </button>
                          <button
                            onClick={() => startCompleteTrip(trip)}
                            className="bg-white hover:bg-slate-50 border border-white/60 text-clay-primary font-bold text-xs px-3.5 py-2 rounded-[16px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                            style={{ fontFamily: "Nunito, sans-serif" }}
                          >
                            Complete
                          </button>
                        </>
                      )}

                      {trip.status === 'in_transit' && (
                        <button
                          onClick={() => startCompleteTrip(trip)}
                          className="bg-white hover:bg-slate-50 border border-white/60 text-clay-primary font-bold text-xs px-3.5 py-2 rounded-[16px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                          style={{ fontFamily: "Nunito, sans-serif" }}
                        >
                          Complete
                        </button>
                      )}

                      {(trip.status === 'draft' || trip.status === 'dispatched' || trip.status === 'in_transit') && (
                        <button
                          onClick={() => handleProgressTrip(trip._id, 'cancelled')}
                          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs px-3.5 py-2 rounded-[16px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                          style={{ fontFamily: "Nunito, sans-serif" }}
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => startEditTrip(trip)}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-[16px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                        style={{ fontFamily: "Nunito, sans-serif" }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteTrip(trip._id)}
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs px-3.5 py-2 rounded-[16px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                        style={{ fontFamily: "Nunito, sans-serif" }}
                      >
                        Delete
                      </button>

                      {trip.status === 'completed' && (
                        <span className="bg-clay-success/15 text-clay-success px-3.5 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-clay-success/20">
                          Completed
                        </span>
                      )}
                      {trip.status === 'cancelled' && (
                        <span className="bg-red-100 text-red-600 px-3.5 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-red-200">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
           TAB 5: MAINTENANCE LOG
           ======================================================== */}
        {activeMenu === 'maintenance' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-white/40 p-4 rounded-[24px] border border-white/40 shadow-clayCard">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Maintenance records</h3>
              <button
                onClick={() => { setSubmitError(''); setShowMaintenanceModal(true); }}
                className="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-bold text-xs px-5 py-3 rounded-[20px] shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                <Plus className="w-4 h-4" />
                <span>Log Service</span>
              </button>
            </div>

            <div className="space-y-6">
              {maintenance.map(log => (
                <div key={log._id} className="p-6 bg-white rounded-[28px] border border-white/60 shadow-clayCard flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div>
                    <h4 className="font-headline font-black text-lg text-clay-foreground uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>
                      {log.vehicle?.name} ({log.vehicle?.reg})
                    </h4>
                    <p className="text-xs text-clay-muted font-bold uppercase mt-1">Issue: {log.issue}</p>
                    <p className="text-xs text-clay-muted font-bold uppercase">Estimated Cost: ₹{log.cost.toLocaleString()}</p>
                    <span className="font-mono text-[9px] text-clay-muted font-bold block mt-2">
                      LOGGED ON: {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    {log.status === 'active' ? (
                      <button
                        onClick={() => handleCloseMaintenance(log._id)}
                        className="bg-white hover:bg-slate-50 border border-white/60 text-clay-success font-bold text-xs px-5 py-3 rounded-[20px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                        style={{ fontFamily: "Nunito, sans-serif" }}
                      >
                        Close & Release
                      </button>
                    ) : (
                      <span className="bg-clay-success/15 text-clay-success px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-clay-success/20">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
           TAB 6: REPORTS & ROI
           ======================================================== */}
        {activeMenu === 'reports' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header with Export buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/40 p-6 rounded-[24px] border border-white/40 shadow-clayCard gap-4">
              <div>
                <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Operations reports</h3>
                <p className="text-xs text-clay-muted font-bold uppercase mt-1">Generate, filter, and export granular fleet operational data sheets</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportPDF}
                  className="bg-white hover:bg-slate-50 text-clay-muted border border-slate-200 font-bold text-xs px-5 py-3 rounded-[20px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  <span>Print PDF</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-bold text-xs px-5 py-3 rounded-[20px] shadow-clayButton active:scale-[0.95] transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter controls panel */}
            <div className="bg-white rounded-[32px] p-6 border border-white/60 shadow-clayCard grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value);
                    // Reset subordinate filters
                    setReportVehicleId(''); setReportDriverId(''); setReportStatus('');
                  }}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-3 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                >
                  <option value="fleet">Fleet Report</option>
                  <option value="driver">Driver Report</option>
                  <option value="fuel">Fuel Report</option>
                  <option value="expense">Expense Report</option>
                  <option value="maintenance">Maintenance Report</option>
                  <option value="cost">Operational Cost Report</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Start Date</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-3 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">End Date</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-3 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs"
                />
              </div>

              {/* Conditional Filters */}
              {(reportType === 'fleet' || reportType === 'fuel' || reportType === 'expense' || reportType === 'maintenance' || reportType === 'cost') && (
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Vehicle</label>
                  <select
                    value={reportVehicleId}
                    onChange={(e) => setReportVehicleId(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-3 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="">-- All --</option>
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>{v.name} ({v.reg})</option>
                    ))}
                  </select>
                </div>
              )}

              {(reportType === 'driver' || reportType === 'cost') && (
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Driver</label>
                  <select
                    value={reportDriverId}
                    onChange={(e) => setReportDriverId(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-3 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="">-- All --</option>
                    {drivers.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {(reportType === 'fleet' || reportType === 'driver') && (
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Status</label>
                  <select
                    value={reportStatus}
                    onChange={(e) => setReportStatus(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-3 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="">-- All --</option>
                    <option value="available">Available</option>
                    {reportType === 'fleet' ? (
                      <>
                        <option value="on_trip">On Trip</option>
                        <option value="in_shop">In Shop</option>
                      </>
                    ) : (
                      <option value="on_trip">On Trip</option>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Visual Analytics section for default view */}
            {reportType === 'fleet' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[32px] p-8 shadow-clayCard border border-white/60">
                  <h3 className="font-headline text-xl font-black uppercase mb-6 text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Vehicle ROI (%)</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roiChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#635F69" tickLine={false} style={{ fontSize: '9px', fontWeight: 'bold' }} />
                        <YAxis stroke="#635F69" tickLine={false} style={{ fontSize: '9px', fontWeight: 'bold' }} />
                        <Tooltip formatter={(value) => `${value}%`} contentStyle={{ background: '#fff', borderRadius: '16px', border: '1px solid #EFEBF5' }} />
                        <Bar dataKey="roi" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-clayCard border border-white/60">
                  <h3 className="font-headline text-xl font-black uppercase mb-6 text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Fuel Efficiency (KM/L)</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fuelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#635F69" tickLine={false} style={{ fontSize: '9px', fontWeight: 'bold' }} />
                        <YAxis stroke="#635F69" tickLine={false} style={{ fontSize: '9px', fontWeight: 'bold' }} />
                        <Tooltip formatter={(value) => `${value} KM/L`} contentStyle={{ background: '#fff', borderRadius: '16px', border: '1px solid #EFEBF5' }} />
                        <Bar dataKey="efficiency" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Structured Table Sheets */}
            <div className="bg-white rounded-[32px] p-8 shadow-clayCard border border-white/60 overflow-x-auto print-section">
              <table className="w-full text-left border-collapse">
                <thead>
                  {reportType === 'fleet' && (
                    <tr className="border-b-2 border-slate-100 font-mono text-[9px] uppercase tracking-wider text-clay-muted">
                      <th className="pb-4">Vehicle</th>
                      <th className="pb-4">Type</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Fuel Cost</th>
                      <th className="pb-4">Maintenance</th>
                      <th className="pb-4">Total Ops Cost</th>
                      <th className="pb-4">Revenue Earned</th>
                      <th className="pb-4">Distance</th>
                    </tr>
                  )}
                  {reportType === 'driver' && (
                    <tr className="border-b-2 border-slate-100 font-mono text-[9px] uppercase tracking-wider text-clay-muted">
                      <th className="pb-4">Driver Name</th>
                      <th className="pb-4">License No</th>
                      <th className="pb-4">Safety Score</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Trips Logged</th>
                      <th className="pb-4">Completed</th>
                      <th className="pb-4">Total Distance</th>
                      <th className="pb-4">Salary Earned</th>
                    </tr>
                  )}
                  {reportType === 'fuel' && (
                    <tr className="border-b-2 border-slate-100 font-mono text-[9px] uppercase tracking-wider text-clay-muted">
                      <th className="pb-4">Vehicle</th>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Fuel Quantity</th>
                      <th className="pb-4">Total Cost</th>
                      <th className="pb-4">Odometer Log</th>
                      <th className="pb-4">Fuel Price Rate</th>
                    </tr>
                  )}
                  {reportType === 'expense' && (
                    <tr className="border-b-2 border-slate-100 font-mono text-[9px] uppercase tracking-wider text-clay-muted">
                      <th className="pb-4">Vehicle</th>
                      <th className="pb-4">Expense Type</th>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Amount</th>
                    </tr>
                  )}
                  {reportType === 'maintenance' && (
                    <tr className="border-b-2 border-slate-100 font-mono text-[9px] uppercase tracking-wider text-clay-muted">
                      <th className="pb-4">Vehicle</th>
                      <th className="pb-4">Describe Issue</th>
                      <th className="pb-4">Total Cost</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Service Date</th>
                    </tr>
                  )}
                  {reportType === 'cost' && (
                    <tr className="border-b-2 border-slate-100 font-mono text-[9px] uppercase tracking-wider text-clay-muted">
                      <th className="pb-4">Trip ID</th>
                      <th className="pb-4">Route</th>
                      <th className="pb-4">Distance (KM)</th>
                      <th className="pb-4">Total Trip Cost</th>
                      <th className="pb-4">Driver Salary</th>
                      <th className="pb-4">Est Fuel Cost</th>
                      <th className="pb-4">Actual Fuel Cost</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-xs">
                  {filteredReportData.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-8 text-center text-clay-muted uppercase text-xs">No records matched active filters.</td>
                    </tr>
                  ) : (
                    filteredReportData.map((row, index) => (
                      <tr key={row.id || index} className="hover:bg-slate-50/50 transition-colors">
                        {reportType === 'fleet' && (
                          <>
                            <td className="py-4 font-headline uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>{row.name} ({row.reg})</td>
                            <td className="py-4 text-clay-muted uppercase">{row.type}</td>
                            <td className="py-4 text-clay-muted uppercase">{row.status}</td>
                            <td className="py-4 text-clay-muted">₹{row.fuelCost.toLocaleString()}</td>
                            <td className="py-4 text-clay-muted">₹{row.maintCost.toLocaleString()}</td>
                            <td className="py-4 text-clay-secondary">₹{row.totalOpsCost.toLocaleString()}</td>
                            <td className="py-4 text-clay-success">₹{row.revenue.toLocaleString()}</td>
                            <td className="py-4 text-clay-muted">{row.distance} KM</td>
                          </>
                        )}
                        {reportType === 'driver' && (
                          <>
                            <td className="py-4 font-headline" style={{ fontFamily: "Nunito, sans-serif" }}>{row.name}</td>
                            <td className="py-4 text-clay-muted font-mono uppercase">{row.license || 'N/A'}</td>
                            <td className="py-4 text-clay-primary">{row.score}%</td>
                            <td className="py-4 text-clay-muted uppercase">{row.status}</td>
                            <td className="py-4 text-clay-muted">{row.tripsCount}</td>
                            <td className="py-4 text-clay-muted">{row.completedCount}</td>
                            <td className="py-4 text-clay-muted">{row.distance} KM</td>
                            <td className="py-4 text-emerald-600">₹{row.salary.toLocaleString()}</td>
                          </>
                        )}
                        {reportType === 'fuel' && (
                          <>
                            <td className="py-4 font-headline" style={{ fontFamily: "Nunito, sans-serif" }}>{row.vehicleName}</td>
                            <td className="py-4 text-clay-muted">{new Date(row.date).toLocaleDateString()}</td>
                            <td className="py-4 text-clay-foreground">{row.liters} L</td>
                            <td className="py-4 text-emerald-600">₹{row.amount.toLocaleString()}</td>
                            <td className="py-4 text-clay-muted font-mono">{row.odometer || 'N/A'} KM</td>
                            <td className="py-4 text-clay-muted font-mono">₹{row.liters > 0 ? (row.amount / row.liters).toFixed(2) : 0} / L</td>
                          </>
                        )}
                        {reportType === 'expense' && (
                          <>
                            <td className="py-4 font-headline" style={{ fontFamily: "Nunito, sans-serif" }}>{row.vehicleName}</td>
                            <td className="py-4"><span className="px-2.5 py-1 bg-slate-100 rounded-full text-[9px] uppercase">{row.type}</span></td>
                            <td className="py-4 text-clay-muted">{new Date(row.date).toLocaleDateString()}</td>
                            <td className="py-4 text-emerald-600">₹{row.amount.toLocaleString()}</td>
                          </>
                        )}
                        {reportType === 'maintenance' && (
                          <>
                            <td className="py-4 font-headline" style={{ fontFamily: "Nunito, sans-serif" }}>{row.vehicleName}</td>
                            <td className="py-4 text-clay-foreground">{row.issue}</td>
                            <td className="py-4 text-clay-muted">₹{row.cost.toLocaleString()}</td>
                            <td className="py-4"><span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[9px] uppercase">{row.resolved}</span></td>
                            <td className="py-4 text-clay-muted">{new Date(row.date).toLocaleDateString()}</td>
                          </>
                        )}
                        {reportType === 'cost' && (
                          <>
                            <td className="py-4 text-clay-primary font-mono">{row.tripId}</td>
                            <td className="py-4 text-clay-foreground">{row.route}</td>
                            <td className="py-4 text-clay-muted">{row.distance} KM</td>
                            <td className="py-4 text-emerald-600">₹{row.revenue.toLocaleString()}</td>
                            <td className="py-4 text-violet-600">₹{row.salary.toLocaleString()}</td>
                            <td className="py-4 text-amber-700">₹{row.estimatedFuel.toLocaleString()}</td>
                            <td className="py-4 text-rose-600">₹{row.actualFuel.toLocaleString()}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
           TAB 7: FUEL LOGS
           ======================================================== */}
        {activeMenu === 'fuel' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/40 p-6 rounded-[24px] border border-white/40 shadow-clayCard gap-4">
              <div>
                <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Fuel Logs Registry</h3>
                <p className="text-xs text-clay-muted font-bold uppercase mt-1">Record and monitor vehicle fuel log transactions</p>
              </div>
              <button
                onClick={() => { setSubmitError(''); setShowAddFuel(true); }}
                className="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-bold text-xs px-5 py-3 rounded-[20px] shadow-clayButton active:scale-[0.95] flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Fuel Log</span>
              </button>
            </div>

            {/* Live Fuel Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-[32px] p-6 border border-white/60 shadow-clayCard flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-[20px] flex items-center justify-center shadow-clayCard">
                  <span className="material-symbols-outlined text-lg">local_gas_station</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-clay-muted tracking-wider">Total Fuel Liters</h4>
                  <p className="font-headline text-2xl font-black text-clay-foreground mt-1">
                    {expenses.filter(e => e.type === 'fuel').reduce((sum, e) => sum + (e.liters || 0), 0).toLocaleString()} L
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-6 border border-white/60 shadow-clayCard flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-[20px] flex items-center justify-center shadow-clayCard">
                  <span className="material-symbols-outlined text-lg">payments</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-clay-muted tracking-wider">Total Fuel Cost</h4>
                  <p className="font-headline text-2xl font-black text-clay-foreground mt-1">
                    ₹{expenses.filter(e => e.type === 'fuel').reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-6 border border-white/60 shadow-clayCard flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-[20px] flex items-center justify-center shadow-clayCard">
                  <span className="material-symbols-outlined text-lg">speed</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-clay-muted tracking-wider">Avg Fuel Price / Litre</h4>
                  <p className="font-headline text-2xl font-black text-clay-foreground mt-1">
                    ₹{(() => {
                      const fuelLogs = expenses.filter(e => e.type === 'fuel');
                      const totalLiters = fuelLogs.reduce((sum, e) => sum + (e.liters || 0), 0);
                      const totalCost = fuelLogs.reduce((sum, e) => sum + (e.amount || 0), 0);
                      return totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : '0.00';
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Fuel Log List */}
            <div className="bg-white rounded-[32px] p-8 shadow-clayCard border border-white/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-clay-muted tracking-widest pb-4">
                      <th className="pb-4">Vehicle</th>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Fuel Quantity</th>
                      <th className="pb-4">Total Cost</th>
                      <th className="pb-4">Odometer Log</th>
                      <th className="pb-4">Fuel Rate</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-xs">
                    {expenses.filter(e => e.type === 'fuel').length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-clay-muted uppercase text-xs">No fuel transactions logged.</td>
                      </tr>
                    ) : (
                      expenses.filter(e => e.type === 'fuel').map(log => (
                        <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 font-headline uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>
                            {log.vehicle ? `${log.vehicle.name} (${log.vehicle.reg})` : 'Unknown Vehicle'}
                          </td>
                          <td className="py-4 text-clay-muted">{new Date(log.date).toLocaleDateString()}</td>
                          <td className="py-4 text-clay-foreground">{log.liters || 0} Liters</td>
                          <td className="py-4 text-emerald-600 font-bold">₹{log.amount?.toLocaleString()}</td>
                          <td className="py-4 text-clay-muted font-mono">{log.odometer || 'N/A'} KM</td>
                          <td className="py-4 text-clay-muted font-mono">₹{log.liters > 0 ? (log.amount / log.liters).toFixed(2) : 0} / L</td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEditFuel(log)}
                                className="bg-[#EFEBF5] hover:bg-white text-clay-primary border border-white/60 font-bold text-[10px] px-3 py-1.5 rounded-[12px] shadow-clayCard transition-all uppercase tracking-wider cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteFuel(log._id)}
                                className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-[10px] px-3 py-1.5 rounded-[12px] shadow-clayCard transition-all uppercase tracking-wider cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
           TAB 8: EXPENSE LOGS
           ======================================================== */}
        {activeMenu === 'expenses' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/40 p-6 rounded-[24px] border border-white/40 shadow-clayCard gap-4">
              <div>
                <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Expense Logs Registry</h3>
                <p className="text-xs text-clay-muted font-bold uppercase mt-1">Record toll, insurance, maintenance, and miscellaneous logistics charges</p>
              </div>
              <button
                onClick={() => { setSubmitError(''); setShowAddExpense(true); }}
                className="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-bold text-xs px-5 py-3 rounded-[20px] shadow-clayButton active:scale-[0.95] flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                <Plus className="w-4 h-4" />
                <span>Log Expense</span>
              </button>
            </div>

            {/* Expense Breakdown Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { type: 'toll', label: 'Toll Fees', color: 'bg-blue-100 text-blue-700' },
                { type: 'insurance', label: 'Insurance Cost', color: 'bg-violet-100 text-violet-700' },
                { type: 'maintenance', label: 'Maintenance Log', color: 'bg-amber-100 text-amber-700' },
                { type: 'miscellaneous', label: 'Miscellaneous', color: 'bg-rose-100 text-rose-700' }
              ].map(card => (
                <div key={card.type} className="bg-white rounded-[32px] p-6 border border-white/60 shadow-clayCard flex flex-col justify-between">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full w-max ${card.color}`}>{card.label}</span>
                  <p className="font-headline text-2xl font-black text-clay-foreground mt-4">
                    ₹{expenses.filter(e => e.type === card.type).reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Expense List */}
            <div className="bg-white rounded-[32px] p-8 shadow-clayCard border border-white/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-clay-muted tracking-widest pb-4">
                      <th className="pb-4">Vehicle</th>
                      <th className="pb-4">Type</th>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4">Additional Details</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-xs">
                    {expenses.filter(e => e.type !== 'fuel').length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-clay-muted uppercase text-xs">No non-fuel logistics expenses logged.</td>
                      </tr>
                    ) : (
                      expenses.filter(e => e.type !== 'fuel').map(log => (
                        <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 font-headline uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>
                            {log.vehicle ? `${log.vehicle.name} (${log.vehicle.reg})` : 'Unknown Vehicle'}
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              log.type === 'toll' ? 'bg-blue-100 text-blue-700' :
                              log.type === 'insurance' ? 'bg-violet-100 text-violet-700' :
                              log.type === 'maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                            }`}>{log.type}</span>
                          </td>
                          <td className="py-4 text-clay-muted">{new Date(log.date).toLocaleDateString()}</td>
                          <td className="py-4 text-emerald-600 font-bold">₹{log.amount?.toLocaleString()}</td>
                          <td className="py-4 text-clay-muted">
                            {log.liters > 0 && `${log.liters} Liters`} {log.odometer > 0 && `| ${log.odometer} KM Odometer`}
                            {log.liters === 0 && log.odometer === 0 && 'System logged'}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEditExpense(log)}
                                className="bg-[#EFEBF5] hover:bg-white text-clay-primary border border-white/60 font-bold text-[10px] px-3 py-1.5 rounded-[12px] shadow-clayCard transition-all uppercase tracking-wider cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(log._id)}
                                className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-[10px] px-3 py-1.5 rounded-[12px] shadow-clayCard transition-all uppercase tracking-wider cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
           TAB 9: AI CO-PILOT CHAT
           ======================================================== */}
        {activeMenu === 'copilot' && (
          <div className="bg-white rounded-[32px] p-8 border border-white/60 shadow-clayCard flex flex-col h-[70vh] animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>AI Fleet Copilot</h3>
                <p className="text-xs text-clay-muted font-bold uppercase mt-1">Intelligent logistics assistant & predictions manager</p>
              </div>
              <span className="bg-clay-primary/10 text-clay-primary px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-clay-primary/20">Active Copilot Online</span>
            </div>

            {/* Quick suggested triggers */}
            <div className="flex flex-wrap gap-2.5 mb-6">
              {[
                "Which vehicle should I dispatch?",
                "Show overdue maintenance.",
                "Which driver is available?",
                "Summarize today's fleet.",
                "Predict maintenance."
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => {
                    setCopilotInput(prompt);
                    // Automatically submit prompt
                    setTimeout(() => {
                      const inputEl = document.getElementById('copilot-submit-btn');
                      if (inputEl) inputEl.click();
                    }, 50);
                  }}
                  className="bg-[#EFEBF5] hover:bg-white text-clay-primary border border-white/60 text-xs px-4 py-2.5 rounded-full shadow-clayCard hover:-translate-y-0.5 active:scale-95 transition-all font-semibold cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 bg-clay-canvas/20 rounded-[24px] p-6 border border-slate-100 shadow-clayPressed min-h-0">
              {copilotMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md rounded-[24px] p-4 text-xs shadow-clayCard border ${
                    msg.role === 'user' 
                      ? 'bg-clay-primary text-white border-clay-primary/20 rounded-tr-none' 
                      : 'bg-white text-clay-foreground border-white/80 rounded-tl-none font-semibold leading-relaxed'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="space-y-2 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-clay-muted border border-white/80 rounded-[24px] rounded-tl-none p-4 text-xs font-bold animate-pulse shadow-clayCard">
                    Copilot is calculating recommendations...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleCopilotSubmit} className="flex gap-4">
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                placeholder="Ask Copilot a question, e.g. Which driver is available?"
                className="flex-1 bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-5 py-4 rounded-[20px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
              />
              <button
                type="submit"
                id="copilot-submit-btn"
                className="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-bold text-xs px-6 py-4 rounded-[20px] shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
           TAB 10: SETTINGS PANEL
           ======================================================== */}
        {activeMenu === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
            {/* Profile Settings */}
            <div className="bg-white rounded-[32px] p-8 border border-white/60 shadow-clayCard space-y-6">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>User Profile Settings</h3>
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Contact Phone Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Operator Password (Leave blank to keep unchanged)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Profile Avatar Image</label>
                  <div className="flex gap-4 items-center">
                    {profileAvatar ? (
                      <img src={profileAvatar} className="w-12 h-12 rounded-2xl object-cover border shadow-md" alt="Avatar" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-400">N/A</div>
                    )}
                    <label className="bg-[#EFEBF5] hover:bg-white text-clay-primary border border-white/60 font-bold text-[10px] px-4 py-2 rounded-[16px] shadow-clayCard cursor-pointer uppercase transition-all tracking-wider">
                      {uploading ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const url = await uploadToImageKit(file, 'profile_avatar');
                          setProfileAvatar(url);
                        } catch (err) { alert('Upload failed: ' + err.message); }
                        setUploading(false);
                      }} />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3 rounded-[16px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton active:scale-[0.95] transition-all cursor-pointer mt-2"
                >
                  Save Profile Settings
                </button>
              </form>
            </div>

            {/* Organization Settings */}
            <div className="bg-white rounded-[32px] p-8 border border-white/60 shadow-clayCard space-y-6">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Organization Configuration</h3>
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Company / Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Operational Timezone</label>
                  <select
                    value={orgTimezone}
                    onChange={(e) => setOrgTimezone(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="IST (UTC+05:30)">IST (UTC+05:30) - Mumbai, Kolkata</option>
                    <option value="EST (UTC-05:00)">EST (UTC-05:00) - New York</option>
                    <option value="GMT (UTC+00:00)">GMT (UTC+00:00) - London</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                    <div>
                      <h4 className="font-mono text-[10px] font-black uppercase tracking-wider text-clay-muted">Active Platform Theme</h4>
                      <p className="text-[10px] text-slate-400">Toggle between theme layouts</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrefTheme(prefTheme === 'light' ? 'dark' : 'light')}
                      className="bg-[#EFEBF5] text-clay-primary font-bold text-xs px-4 py-2 rounded-full border border-white/60 shadow-clayCard uppercase transition-all"
                    >
                      {prefTheme.toUpperCase()} MODE
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-mono text-[10px] font-black uppercase tracking-wider text-clay-muted">Platform Notifications</h4>
                      <p className="text-[10px] text-slate-400">Receive browser alarm popups</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrefNotifications(!prefNotifications)}
                      className={`font-bold text-xs px-4 py-2 rounded-full border transition-all ${
                        prefNotifications ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'
                      }`}
                    >
                      {prefNotifications ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3 rounded-[16px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton active:scale-[0.95] transition-all cursor-pointer mt-2"
                >
                  Update Configuration
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Dynamic Notifications Drawer Overlay */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="fixed inset-0 bg-[#332F3A]/20 backdrop-blur-sm transition-opacity" onClick={() => setShowNotificationsDrawer(false)} />
          <div className="relative w-screen max-w-md bg-white shadow-claySurface border-l border-slate-100 flex flex-col h-full z-50 p-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="font-headline text-xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Platform Notifications</h3>
                <p className="text-[9px] text-clay-muted font-bold uppercase mt-0.5">Real-time status warnings and critical indicators</p>
              </div>
              <button onClick={() => setShowNotificationsDrawer(false)} className="text-clay-muted hover:text-clay-foreground font-black text-xs uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {/* Mark All as Read button */}
            {notifications.filter(n => !readNotificationIds.includes(n.id)).length > 0 && (
              <button
                onClick={() => setReadNotificationIds(notifications.map(n => n.id))}
                className="w-full mb-4 bg-slate-50 hover:bg-slate-100 text-clay-muted text-center font-bold text-[10px] py-2 rounded-xl border border-slate-200 transition-all uppercase tracking-wider cursor-pointer"
              >
                Mark all as read
              </button>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-20 text-clay-muted">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">notifications_off</span>
                  <p className="font-bold text-[10px] uppercase tracking-wider">No diagnostic alerts triggered today.</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const isRead = readNotificationIds.includes(notif.id);
                  return (
                    <div 
                      key={notif.id} 
                      className={`p-4 rounded-[20px] border shadow-clayCard transition-all relative group flex gap-3 ${
                        isRead ? 'bg-slate-50/50 border-slate-200 opacity-60' : 'bg-white border-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
                        notif.severity === 'error' ? 'bg-red-100 text-red-600' :
                        notif.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                        notif.severity === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <span className="material-symbols-outlined text-sm">
                          {notif.severity === 'error' ? 'dangerous' :
                           notif.severity === 'warning' ? 'warning' :
                           notif.severity === 'success' ? 'check_circle' : 'info'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-headline font-black text-xs uppercase text-slate-800" style={{ fontFamily: "Nunito, sans-serif" }}>{notif.title}</h5>
                        <p className="text-[10px] text-clay-muted leading-relaxed font-semibold">{notif.message}</p>
                        <span className="text-[8px] font-mono font-bold text-slate-400 block pt-1 uppercase">{notif.time}</span>
                      </div>
                      {!isRead && (
                        <button
                          onClick={() => setReadNotificationIds(prev => [...prev, notif.id])}
                          className="absolute right-4 top-4 text-clay-primary hover:text-clay-secondary font-black text-[9px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
         MODALS
         ======================================================== */}

      {/* 1. Add Vehicle Modal - Expanded with collaborator fields */}
      {showAddVehicle && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-hidden flex flex-col max-h-[90vh]">

            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>{isEditVehicleMode ? 'Edit Vehicle' : 'Register Vehicle'}</h3>
              <button onClick={() => { setShowAddVehicle(false); resetVehicleForm(); }} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2 flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleAddVehicleSubmit} className="space-y-5 overflow-y-auto pr-2 flex-1 min-h-0">
              <div className="space-y-5">
                {/* Core Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Registration Number (Unique)</label>
                    <input
                      type="text"
                      placeholder="e.g. DL-3C-SG-1024"
                      value={vReg}
                      onChange={(e) => setVReg(e.target.value)}
                      className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Vehicle Model/Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Volvo FH16"
                      value={vName}
                      onChange={(e) => setVName(e.target.value)}
                      className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Type</label>
                    <select
                      value={vType}
                      onChange={(e) => setVType(e.target.value)}
                      className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                    >
                      <option value="Truck">Truck</option>
                      <option value="Trailer">Trailer</option>
                      <option value="LJV">LJV</option>
                      <option value="Tipper">Tipper</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Max Load Cap (Tons)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={vMaxLoad}
                      onChange={(e) => setVMaxLoad(e.target.value)}
                      className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Acquisition Cost (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 85000"
                      value={vCost}
                      onChange={(e) => setVCost(e.target.value)}
                      className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Extended Basic Info Section (Collaborator UI additions) */}
                <div className="border-t border-slate-100 pt-5 mt-5">
                  <h4 className="font-headline font-black text-xs uppercase tracking-wider text-clay-primary mb-4" style={{ fontFamily: "Nunito, sans-serif" }}>Basic Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Vehicle Nickname</label>
                      <input
                        type="text"
                        placeholder="e.g. Blue Thunder"
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Brand</label>
                      <input
                        type="text"
                        placeholder="e.g. Volvo / Tata"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Model</label>
                      <input
                        type="text"
                        placeholder="e.g. FH16"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Manufacturing Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2024"
                        value={newMfgYear}
                        onChange={(e) => setNewMfgYear(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Color</label>
                      <input
                        type="text"
                        placeholder="e.g. White"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">VIN / Chassis Number</label>
                      <input
                        type="text"
                        placeholder="17-digit code"
                        value={newVin}
                        onChange={(e) => setNewVin(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Engine Number</label>
                      <input
                        type="text"
                        placeholder="e.g. ENG-8830-4X"
                        value={newEngineNum}
                        onChange={(e) => setNewEngineNum(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col space-y-1">
                        <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Reg State</label>
                        <input
                          type="text"
                          placeholder="e.g. MH"
                          value={newRegState}
                          onChange={(e) => setNewRegState(e.target.value)}
                          className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Reg Date</label>
                        <input
                          type="text"
                          placeholder="YYYY-MM-DD"
                          value={newRegDate}
                          onChange={(e) => setNewRegDate(e.target.value)}
                          className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capacity (Collaborator UI additions) */}
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="font-headline font-black text-xs uppercase tracking-wider text-clay-primary mb-4" style={{ fontFamily: "Nunito, sans-serif" }}>Capacity Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Seating Capacity</label>
                      <input
                        type="text"
                        placeholder="e.g. 2"
                        value={newSeatingCapacity}
                        onChange={(e) => setNewSeatingCapacity(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Cargo Capacity (Volume)</label>
                      <input
                        type="text"
                        placeholder="e.g. 40 cubic meters"
                        value={newCargoCapacity}
                        onChange={(e) => setNewCargoCapacity(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Max Gross Weight (kg)</label>
                      <input
                        type="text"
                        placeholder="e.g. 25,000"
                        value={newMaxGrossWeight}
                        onChange={(e) => setNewMaxGrossWeight(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Fuel Tank Capacity (Liters)</label>
                      <input
                        type="text"
                        placeholder="e.g. 400"
                        value={newFuelTankCapacity}
                        onChange={(e) => setNewFuelTankCapacity(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Ownership details (Collaborator UI additions) */}
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="font-headline font-black text-xs uppercase tracking-wider text-clay-primary mb-4" style={{ fontFamily: "Nunito, sans-serif" }}>Ownership Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Owner Name</label>
                      <input
                        type="text"
                        placeholder="e.g. TransitOps North"
                        value={newOwnerName}
                        onChange={(e) => setNewOwnerName(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Lease Type</label>
                      <select
                        value={newLeaseType}
                        onChange={(e) => setNewLeaseType(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                      >
                        <option value="Owned">Owned</option>
                        <option value="Leased">Leased</option>
                        <option value="Rented">Rented</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Purchase Date</label>
                      <input
                        type="text"
                        placeholder="YYYY-MM-DD"
                        value={newPurchaseDate}
                        onChange={(e) => setNewPurchaseDate(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Purchase Cost (₹)</label>
                      <input
                        type="text"
                        placeholder="e.g. 120000"
                        value={newPurchaseCost}
                        onChange={(e) => setNewPurchaseCost(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Vendor</label>
                      <input
                        type="text"
                        placeholder="e.g. Volvo Trucks India"
                        value={newVendor}
                        onChange={(e) => setNewVendor(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Warranty Expiry</label>
                      <input
                        type="text"
                        placeholder="YYYY-MM-DD"
                        value={newWarrantyExpiry}
                        onChange={(e) => setNewWarrantyExpiry(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Status Section */}
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="font-headline font-black text-xs uppercase tracking-wider text-clay-primary mb-4" style={{ fontFamily: "Nunito, sans-serif" }}>Vehicle Status & Assignment</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Vehicle Status</label>
                      <select
                        value={newVehicleStatus}
                        onChange={(e) => setNewVehicleStatus(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                      >
                        <option value="available">Available</option>
                        <option value="on_trip">On Trip</option>
                        <option value="reserved">Reserved</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Inactive</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Assigned Driver</label>
                      <select
                        value={newAssignedDriver}
                        onChange={(e) => setNewAssignedDriver(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {drivers.map(drv => (
                          <option key={drv._id} value={drv._id}>{drv.name} ({drv.license})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Depot Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Okhla Depot, New Delhi"
                        value={newDepotLocation}
                        onChange={(e) => setNewDepotLocation(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Current Odometer (KM)</label>
                      <input
                        type="number"
                        placeholder="e.g. 12000"
                        value={vOdometer}
                        onChange={(e) => setVOdometer(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Fuel Information Section */}
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="font-headline font-black text-xs uppercase tracking-wider text-clay-primary mb-4" style={{ fontFamily: "Nunito, sans-serif" }}>Fuel Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Fuel Type</label>
                      <select
                        value={newFuelType}
                        onChange={(e) => setNewFuelType(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                      >
                        <option value="Diesel">Diesel</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Electric">Electric</option>
                        <option value="CNG">CNG</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Fuel Card Number</label>
                      <input
                        type="text"
                        placeholder="e.g. FC-9088-293"
                        value={newFuelCardNumber}
                        onChange={(e) => setNewFuelCardNumber(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Mileage (KM/L)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 15.5"
                        value={newMileage}
                        onChange={(e) => setNewMileage(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Avg Monthly Consumption (L)</label>
                      <input
                        type="number"
                        placeholder="e.g. 450"
                        value={newAvgMonthlyFuelConsumption}
                        onChange={(e) => setNewAvgMonthlyFuelConsumption(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Information Section */}
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="font-headline font-black text-xs uppercase tracking-wider text-clay-primary mb-4" style={{ fontFamily: "Nunito, sans-serif" }}>Insurance Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Insurance Company</label>
                      <input
                        type="text"
                        placeholder="e.g. ICICI Lombard"
                        value={insCompany}
                        onChange={(e) => setInsCompany(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Policy Number</label>
                      <input
                        type="text"
                        placeholder="e.g. POL-9088-A"
                        value={insPolicyNumber}
                        onChange={(e) => setInsPolicyNumber(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Coverage Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500000"
                        value={insCoverageAmount}
                        onChange={(e) => setInsCoverageAmount(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Reminder Before Expiry</label>
                      <select
                        value={insReminderDays}
                        onChange={(e) => setInsReminderDays(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                      >
                        <option value="7">7 Days</option>
                        <option value="15">15 Days</option>
                        <option value="30">30 Days</option>
                        <option value="60">60 Days</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Start Date</label>
                      <input
                        type="date"
                        value={insStartDate}
                        onChange={(e) => setInsStartDate(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-[#1E293B] font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Expiry Date</label>
                      <input
                        type="date"
                        value={insExpiryDate}
                        onChange={(e) => setInsExpiryDate(e.target.value)}
                        className="bg-[#EFEBF5] border-0 text-[#1E293B] font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Documents Section */}
                <div className="border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowDocSection(!showDocSection)}
                    className="w-full flex items-center justify-between bg-clay-canvas/60 hover:bg-clay-canvas p-4 rounded-[20px] font-headline font-black text-xs uppercase tracking-wider text-clay-primary shadow-clayCard active:scale-[0.99] transition-all cursor-pointer"
                    style={{ fontFamily: "Nunito, sans-serif" }}
                  >
                    <span>Vehicle Documents</span>
                    <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: showDocSection ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      expand_more
                    </span>
                  </button>

                  {showDocSection && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                      {[
                        { label: 'RC (Registration Certificate)', file: rcFile, setFile: setRcFile, issue: rcIssue, setIssue: setRcIssue, expiry: rcExpiry, setExpiry: setRcExpiry, prefix: 'rc' },
                        { label: 'Insurance Policy', file: insFile, setFile: setInsFile, issue: insIssue, setIssue: setInsIssue, expiry: insExpiry, setExpiry: setInsExpiry, prefix: 'ins' },
                        { label: 'Pollution Certificate (PUC)', file: polFile, setFile: setPolFile, issue: polIssue, setIssue: setPolIssue, expiry: polExpiry, setExpiry: setPolExpiry, prefix: 'pol' },
                        { label: 'Fitness Certificate', file: fitFile, setFile: setFitFile, issue: fitIssue, setIssue: setFitIssue, expiry: fitExpiry, setExpiry: setFitExpiry, prefix: 'fit' },
                        { label: 'Road Permit', file: perFile, setFile: setPerFile, issue: perIssue, setIssue: setPerIssue, expiry: perExpiry, setExpiry: setPerExpiry, prefix: 'per' },
                        { label: 'Tax Receipt', file: taxFile, setFile: setTaxFile, issue: taxIssue, setIssue: setTaxIssue, expiry: taxExpiry, setExpiry: setTaxExpiry, prefix: 'tax' }
                      ].map((doc) => {
                        const statusObj = getDocStatus(doc.expiry);
                        return (
                          <div key={doc.prefix} className="bg-clay-canvas/40 p-4 rounded-[24px] border border-white/60 shadow-clayPressed flex flex-col space-y-3.5 text-xs text-left">
                            <div className="flex justify-between items-start border-b border-slate-200/50 pb-2">
                              <span className="font-headline font-black text-[11px] uppercase tracking-wide text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>
                                {doc.label}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-extrabold ${statusObj.color}`}>
                                {statusObj.label}
                              </span>
                            </div>

                            {/* ImageKit File Upload */}
                            <div className="flex flex-col space-y-1">
                              <label className="font-mono text-[8px] font-black uppercase tracking-wider text-clay-muted">Document File</label>
                              <div className={`relative w-full h-10 rounded-[16px] shadow-clayPressed flex items-center justify-between px-3 cursor-pointer hover:bg-white transition-all overflow-hidden border ${docUploading[doc.prefix] ? 'bg-amber-50 border-amber-300' : doc.file ? 'bg-emerald-50 border-emerald-200' : 'bg-[#EFEBF5] border-transparent focus-within:border-clay-primary/20'}`}>
                                <span className="text-[10px] font-semibold truncate pr-4 flex items-center gap-1.5">
                                  {docUploading[doc.prefix] ? (
                                    <><span className="inline-block w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></span><span className="text-amber-600">Uploading…</span></>
                                  ) : doc.file ? (
                                    <><span className="text-emerald-600">✓</span><span className="text-emerald-700 truncate">{doc.file.startsWith('http') ? 'Uploaded to ImageKit' : doc.file}</span></>
                                  ) : (
                                    <span className="text-clay-muted">Select file (PDF / Image)</span>
                                  )}
                                </span>
                                {!docUploading[doc.prefix] && (
                                  <span className={`text-white text-[9px] font-bold px-3 py-1 rounded-[10px] uppercase tracking-wider cursor-pointer shadow-clayButton flex-shrink-0 ${doc.file ? 'bg-emerald-500' : 'bg-clay-primary'}`}>
                                    {doc.file ? 'Replace' : 'Choose'}
                                  </span>
                                )}
                                <input
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  disabled={docUploading[doc.prefix]}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setDocUploading(prev => ({ ...prev, [doc.prefix]: true }));
                                    try {
                                      const url = await uploadToImageKit(file, 'vehicle-docs');
                                      doc.setFile(url);
                                    } catch (err) {
                                      alert(`Upload failed: ${err.message}`);
                                    } finally {
                                      setDocUploading(prev => ({ ...prev, [doc.prefix]: false }));
                                    }
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                              </div>
                              {doc.file && doc.file.startsWith('http') && (
                                <a
                                  href={doc.file}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-1 flex items-center justify-center gap-1.5 w-full bg-white/80 hover:bg-white text-clay-primary border border-white/60 font-bold text-[10px] py-2 rounded-[12px] shadow-clayCard hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wider cursor-pointer"
                                  style={{ fontFamily: "Nunito, sans-serif" }}
                                >
                                  <span className="material-symbols-outlined text-[13px]">visibility</span>
                                  <span>View Uploaded Document</span>
                                </a>
                              )}
                            </div>



                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col space-y-1">
                                <label className="font-mono text-[8px] font-black uppercase tracking-wider text-clay-muted">Issue Date</label>
                                <input
                                  type="date"
                                  value={doc.issue}
                                  onChange={(e) => doc.setIssue(e.target.value)}
                                  className="bg-[#EFEBF5] border-0 text-[#1E293B] font-semibold px-2 py-2 rounded-[12px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-2 focus:ring-clay-primary/10 text-[10px]"
                                />
                              </div>
                              <div className="flex flex-col space-y-1">
                                <label className="font-mono text-[8px] font-black uppercase tracking-wider text-clay-muted">Expiry Date</label>
                                <input
                                  type="date"
                                  value={doc.expiry}
                                  onChange={(e) => doc.setExpiry(e.target.value)}
                                  className="bg-[#EFEBF5] border-0 text-[#1E293B] font-semibold px-2 py-2 rounded-[12px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-2 focus:ring-clay-primary/10 text-[10px]"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-4 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed transition-all cursor-pointer flex-shrink-0"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {isEditVehicleMode ? '✏️ Update Vehicle' : '🚛 Register Vehicle'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Driver Modal */}
      {showAddDriver && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md max-h-[90vh] bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-y-auto">

            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Create Driver Profile</h3>
              <button onClick={() => setShowAddDriver(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleAddDriverSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Driver Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">License Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DL-HEV-9902"
                    value={dLicense}
                    onChange={(e) => setDLicense(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">License Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Class A Heavy"
                    value={dCategory}
                    onChange={(e) => setDCategory(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">License Expiry Date</label>
                <input
                  type="date"
                  value={dExpiry}
                  onChange={(e) => setDExpiry(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs cursor-pointer text-clay-muted"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Contact Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9988776655"
                    value={dContact}
                    onChange={(e) => setDContact(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@transitops.co"
                    value={dEmail}
                    onChange={(e) => setDEmail(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Safety Score (%)</label>
                  <input
                    type="text"
                    value="Auto-calculated (95% Base)"
                    className="bg-slate-100 border-0 text-clay-muted font-semibold px-4 py-2.5 rounded-[16px] shadow-inner focus:outline-none transition-all text-xs cursor-not-allowed"
                    disabled
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Status</label>
                  <select
                    value={dStatus}
                    onChange={(e) => setDStatus(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                    required
                  >
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="suspended">Suspended</option>
                    <option value="off_duty">Off Duty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Aadhaar Number</label>
                  <input
                    type="text"
                    maxLength="12"
                    placeholder="e.g. 123456789012"
                    value={dAadhaar}
                    onChange={(e) => setDAadhaar(e.target.value.replace(/\D/g, ''))}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">PAN Card Number</label>
                  <input
                    type="text"
                    maxLength="10"
                    placeholder="e.g. ABCDE1234F"
                    value={dPan}
                    onChange={(e) => setDPan(e.target.value.toUpperCase())}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Blood Group</label>
                  <select
                    value={dBloodGroup}
                    onChange={(e) => setDBloodGroup(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Residential Address</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Sector-15, Noida, UP, India"
                    value={dAddress}
                    onChange={(e) => setDAddress(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs resize-none"
                  />
                </div>
              </div>

              {/* Document Uploads Section */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <h4 className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted mb-3">Document Uploads (Optional)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 bg-[#EFEBF5] px-4 py-2.5 rounded-[16px] shadow-clayPressed cursor-pointer hover:bg-white transition-all text-xs font-semibold ${dAvatar ? 'text-clay-success' : 'text-clay-muted'}`}>
                    <span className="material-symbols-outlined text-sm">{dAvatar ? 'check_circle' : 'person'}</span>
                    {dAvatar ? 'Photo ✓' : 'Profile Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploading(true);
                      try { const url = await uploadToImageKit(file, `avatar_new`); setDAvatar(url); } catch (err) { alert('Upload failed'); }
                      setUploading(false);
                    }} />
                  </label>
                  <label className={`flex items-center gap-2 bg-[#EFEBF5] px-4 py-2.5 rounded-[16px] shadow-clayPressed cursor-pointer hover:bg-white transition-all text-xs font-semibold ${dAadhaarFile ? 'text-clay-success' : 'text-clay-muted'}`}>
                    <span className="material-symbols-outlined text-sm">{dAadhaarFile ? 'check_circle' : 'upload_file'}</span>
                    {dAadhaarFile ? 'Aadhaar ✓' : 'Aadhaar PDF'}
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploading(true);
                      try { const url = await uploadToImageKit(file, `aadhaar_new`); setDAadhaarFile(url); } catch (err) { alert('Upload failed'); }
                      setUploading(false);
                    }} />
                  </label>
                  <label className={`flex items-center gap-2 bg-[#EFEBF5] px-4 py-2.5 rounded-[16px] shadow-clayPressed cursor-pointer hover:bg-white transition-all text-xs font-semibold ${dPanFile ? 'text-clay-success' : 'text-clay-muted'}`}>
                    <span className="material-symbols-outlined text-sm">{dPanFile ? 'check_circle' : 'upload_file'}</span>
                    {dPanFile ? 'PAN ✓' : 'PAN PDF'}
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploading(true);
                      try { const url = await uploadToImageKit(file, `pan_new`); setDPanFile(url); } catch (err) { alert('Upload failed'); }
                      setUploading(false);
                    }} />
                  </label>
                  <label className={`flex items-center gap-2 bg-[#EFEBF5] px-4 py-2.5 rounded-[16px] shadow-clayPressed cursor-pointer hover:bg-white transition-all text-xs font-semibold ${dDlFile ? 'text-clay-success' : 'text-clay-muted'}`}>
                    <span className="material-symbols-outlined text-sm">{dDlFile ? 'check_circle' : 'upload_file'}</span>
                    {dDlFile ? 'DL ✓' : 'DL PDF'}
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploading(true);
                      try { const url = await uploadToImageKit(file, `dl_new`); setDDlFile(url); } catch (err) { alert('Upload failed'); }
                      setUploading(false);
                    }} />
                  </label>
                </div>
                {uploading && <p className="text-[10px] font-bold text-clay-primary mt-2 animate-pulse uppercase">Uploading to cloud storage...</p>}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed transition-all cursor-pointer mt-2 disabled:opacity-50"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {uploading ? 'Uploading Files...' : 'Register Driver'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditDriver && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md max-h-[90vh] bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-y-auto">

            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Modify Driver Profile</h3>
              <button onClick={() => setShowEditDriver(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleEditDriverSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Driver Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">License Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DL-HEV-9902"
                    value={dLicense}
                    onChange={(e) => setDLicense(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">License Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Class A Heavy"
                    value={dCategory}
                    onChange={(e) => setDCategory(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">License Expiry Date</label>
                <input
                  type="date"
                  value={dExpiry}
                  onChange={(e) => setDExpiry(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs cursor-pointer text-clay-muted"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Contact Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9988776655"
                    value={dContact}
                    onChange={(e) => setDContact(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@transitops.co"
                    value={dEmail}
                    onChange={(e) => setDEmail(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Safety Score (%)</label>
                  <input
                    type="text"
                    value={`${dScore}% (Auto-Calculated)`}
                    className="bg-slate-100 border-0 text-clay-muted font-semibold px-4 py-2.5 rounded-[16px] shadow-inner focus:outline-none transition-all text-xs cursor-not-allowed"
                    disabled
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Status</label>
                  <select
                    value={dStatus}
                    onChange={(e) => setDStatus(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                    required
                  >
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="suspended">Suspended</option>
                    <option value="off_duty">Off Duty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Aadhaar Number</label>
                  <input
                    type="text"
                    maxLength="12"
                    placeholder="e.g. 123456789012"
                    value={dAadhaar}
                    onChange={(e) => setDAadhaar(e.target.value.replace(/\D/g, ''))}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">PAN Card Number</label>
                  <input
                    type="text"
                    maxLength="10"
                    placeholder="e.g. ABCDE1234F"
                    value={dPan}
                    onChange={(e) => setDPan(e.target.value.toUpperCase())}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Blood Group</label>
                  <select
                    value={dBloodGroup}
                    onChange={(e) => setDBloodGroup(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Residential Address</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Sector-15, Noida, UP, India"
                    value={dAddress}
                    onChange={(e) => setDAddress(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs resize-none"
                  />
                </div>
              </div>

              {/* Document Uploads Section */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <h4 className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted mb-3">Document Uploads</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 bg-[#EFEBF5] px-4 py-2.5 rounded-[16px] shadow-clayPressed cursor-pointer hover:bg-white transition-all text-xs font-semibold ${dAvatar ? 'text-clay-success' : 'text-clay-muted'}`}>
                    <span className="material-symbols-outlined text-sm">{dAvatar ? 'check_circle' : 'person'}</span>
                    {dAvatar ? 'Photo ✓' : 'Profile Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploading(true);
                      try { const url = await uploadToImageKit(file, `avatar_edit`); setDAvatar(url); } catch (err) { alert('Upload failed'); }
                      setUploading(false);
                    }} />
                  </label>
                  <label className={`flex items-center gap-2 bg-[#EFEBF5] px-4 py-2.5 rounded-[16px] shadow-clayPressed cursor-pointer hover:bg-white transition-all text-xs font-semibold ${dAadhaarFile ? 'text-clay-success' : 'text-clay-muted'}`}>
                    <span className="material-symbols-outlined text-sm">{dAadhaarFile ? 'check_circle' : 'upload_file'}</span>
                    {dAadhaarFile ? 'Aadhaar ✓' : 'Aadhaar PDF'}
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploading(true);
                      try { const url = await uploadToImageKit(file, `aadhaar_edit`); setDAadhaarFile(url); } catch (err) { alert('Upload failed'); }
                      setUploading(false);
                    }} />
                  </label>
                  <label className={`flex items-center gap-2 bg-[#EFEBF5] px-4 py-2.5 rounded-[16px] shadow-clayPressed cursor-pointer hover:bg-white transition-all text-xs font-semibold ${dPanFile ? 'text-clay-success' : 'text-clay-muted'}`}>
                    <span className="material-symbols-outlined text-sm">{dPanFile ? 'check_circle' : 'upload_file'}</span>
                    {dPanFile ? 'PAN ✓' : 'PAN PDF'}
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploading(true);
                      try { const url = await uploadToImageKit(file, `pan_edit`); setDPanFile(url); } catch (err) { alert('Upload failed'); }
                      setUploading(false);
                    }} />
                  </label>
                  <label className={`flex items-center gap-2 bg-[#EFEBF5] px-4 py-2.5 rounded-[16px] shadow-clayPressed cursor-pointer hover:bg-white transition-all text-xs font-semibold ${dDlFile ? 'text-clay-success' : 'text-clay-muted'}`}>
                    <span className="material-symbols-outlined text-sm">{dDlFile ? 'check_circle' : 'upload_file'}</span>
                    {dDlFile ? 'DL ✓' : 'DL PDF'}
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploading(true);
                      try { const url = await uploadToImageKit(file, `dl_edit`); setDDlFile(url); } catch (err) { alert('Upload failed'); }
                      setUploading(false);
                    }} />
                  </label>
                </div>
                {uploading && <p className="text-[10px] font-bold text-clay-primary mt-2 animate-pulse uppercase">Uploading to cloud storage...</p>}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed transition-all cursor-pointer mt-2 disabled:opacity-50"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {uploading ? 'Uploading Files...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Dispatch Trip Modal */}
      {showDispatchTrip && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md max-h-[90vh] bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Dispatch Log Registry</h3>
              <button onClick={() => setShowDispatchTrip(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleDispatchTripSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Source</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune Depot"
                    value={tSource}
                    onChange={(e) => setTSource(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Destination</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai Port"
                    value={tDest}
                    onChange={(e) => setTDest(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Select Available Vehicle</label>
                <select
                  value={tVehicleId}
                  onChange={(e) => setTVehicleId(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  required
                >
                  <option value="">-- Choose --</option>
                  {dispatchableVehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.reg}) - Max: {v.maxLoad}T</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Select Available Driver</label>
                <select
                  value={tDriverId}
                  onChange={(e) => setTDriverId(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  required
                >
                  <option value="">-- Choose --</option>
                  {dispatchableDrivers.map(d => (
                    <option key={d._id} value={d._id}>{d.name} (Safety Score: {d.score}%)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Cargo Weight (Tons)</label>
                  <input
                    type="number"
                    placeholder="e.g. 8"
                    value={tWeight}
                    onChange={(e) => setTWeight(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Distance (KM)</label>
                  <input
                    type="number"
                    placeholder="e.g. 180"
                    value={tDistance}
                    onChange={(e) => setTDistance(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Total Trip Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="Auto-calculated if blank"
                    value={tRevenue}
                    onChange={(e) => setTRevenue(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Workflow Status</label>
                  <select
                    value={tStatus}
                    onChange={(e) => setTStatus(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="in_transit">In Transit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Driver Salary (₹)</label>
                  <input
                    type="number"
                    placeholder="Auto-calculated if blank"
                    value={tDriverSalary}
                    onChange={(e) => setTDriverSalary(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Est. Fuel Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="Auto-calculated if blank"
                    value={tEstimatedFuelCost}
                    onChange={(e) => setTEstimatedFuelCost(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed transition-all cursor-pointer mt-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Initiate Dispatch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3.1 Edit Trip Modal */}
      {showEditTrip && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md max-h-[90vh] bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Edit Trip Registry</h3>
              <button onClick={() => setShowEditTrip(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleEditTripSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Source</label>
                  <input
                    type="text"
                    value={tSource}
                    onChange={(e) => setTSource(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Destination</label>
                  <input
                    type="text"
                    value={tDest}
                    onChange={(e) => setTDest(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Vehicle Assignee</label>
                <select
                  value={tVehicleId}
                  onChange={(e) => setTVehicleId(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  required
                >
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.reg}) - Status: {v.status}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Driver Assignee</label>
                <select
                  value={tDriverId}
                  onChange={(e) => setTDriverId(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  required
                >
                  {drivers.map(d => (
                    <option key={d._id} value={d._id}>{d.name} - Score: {d.score}% - Status: {d.status}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Cargo Load (Tons)</label>
                  <input
                    type="number"
                    value={tWeight}
                    onChange={(e) => setTWeight(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Planned (KM)</label>
                  <input
                    type="number"
                    value={tDistance}
                    onChange={(e) => setTDistance(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Actual Distance (KM)</label>
                  <input
                    type="number"
                    value={tActualDistance}
                    onChange={(e) => setTActualDistance(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Total Trip Cost (₹)</label>
                  <input
                    type="number"
                    value={tRevenue}
                    onChange={(e) => setTRevenue(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Driver Salary (₹)</label>
                  <input
                    type="number"
                    value={tDriverSalary}
                    onChange={(e) => setTDriverSalary(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-3 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Est. Fuel Cost (₹)</label>
                  <input
                    type="number"
                    value={tEstimatedFuelCost}
                    onChange={(e) => setTEstimatedFuelCost(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-3 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Act. Fuel Cost (₹)</label>
                  <input
                    type="number"
                    value={tActualFuelCost}
                    onChange={(e) => setTActualFuelCost(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-3 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Trip Workflow Status</label>
                <select
                  value={tStatus}
                  onChange={(e) => setTStatus(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="in_transit">In Transit</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed transition-all cursor-pointer mt-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Update Trip Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3.2 Complete Trip Modal */}
      {showCompleteTrip && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-hidden">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Complete assigned Trip</h3>
              <button onClick={() => setShowCompleteTrip(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleCompleteTripSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Actual Distance (KM)</label>
                  <input
                    type="number"
                    placeholder="Actual KM traveled"
                    value={cActualDistance}
                    onChange={(e) => setCActualDistance(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Total Trip Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="Total trip payout cost"
                    value={cRevenue}
                    onChange={(e) => setCRevenue(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Driver Salary (₹)</label>
                  <input
                    type="number"
                    placeholder="Salary for this trip"
                    value={cDriverSalary}
                    onChange={(e) => setCDriverSalary(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Actual Fuel Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="Actual fuel cost spent"
                    value={cActualFuelCost}
                    onChange={(e) => setCActualFuelCost(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#10B981] to-[#059669] text-white py-3.5 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton hover:shadow-[14px_14px_28px_rgba(16,185,129,0.35)] active:scale-[0.95] active:shadow-clayPressed transition-all cursor-pointer mt-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Log Completion & Clear Assets
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-hidden">

            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Log Vehicle Service</h3>
              <button onClick={() => setShowMaintenanceModal(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Select Vehicle</label>
                <select
                  value={mVehicleId}
                  onChange={(e) => setMVehicleId(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  required
                >
                  <option value="">-- Choose --</option>
                  {vehicles.filter(v => v.status !== 'retired').map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.reg}) - Status: {v.status}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Describe Maintenance Issue</label>
                <input
                  type="text"
                  placeholder="e.g. Brake pad replacement"
                  value={mIssue}
                  onChange={(e) => setMIssue(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Estimated Cost (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={mCost}
                  onChange={(e) => setMCost(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed transition-all cursor-pointer mt-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Log Maintenance
              </button>
            </form>
          </div>
        </div>
      )}

          {/* 5. Add Fuel Modal */}
      {showAddFuel && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-hidden">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Log Fuel Refill</h3>
              <button onClick={() => setShowAddFuel(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleAddFuelSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Select Vehicle</label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  required
                >
                  <option value="">-- Choose --</option>
                  {vehicles.filter(v => v.status !== 'retired').map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.reg})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Quantity (Liters)</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Total Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 11400"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Odometer Reading (KM)</label>
                  <input
                    type="number"
                    placeholder="Current KM"
                    value={fuelOdometer}
                    onChange={(e) => setFuelOdometer(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Transaction Date</label>
                  <input
                    type="date"
                    value={fuelDate}
                    onChange={(e) => setFuelDate(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton active:scale-[0.95] transition-all cursor-pointer mt-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Log Fuel Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5.1 Edit Fuel Modal */}
      {showEditFuel && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-hidden">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Edit Fuel Log</h3>
              <button onClick={() => setShowEditFuel(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleEditFuelSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Select Vehicle</label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  required
                >
                  <option value="">-- Choose --</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.reg})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Quantity (Liters)</label>
                  <input
                    type="number"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Total Cost (₹)</label>
                  <input
                    type="number"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Odometer Reading (KM)</label>
                  <input
                    type="number"
                    value={fuelOdometer}
                    onChange={(e) => setFuelOdometer(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Transaction Date</label>
                  <input
                    type="date"
                    value={fuelDate}
                    onChange={(e) => setFuelDate(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton active:scale-[0.95] transition-all cursor-pointer mt-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-hidden">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Log General Expense</h3>
              <button onClick={() => setShowAddExpense(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Select Vehicle</label>
                <select
                  value={eVehicleId}
                  onChange={(e) => setEVehicleId(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  required
                >
                  <option value="">-- Choose --</option>
                  {vehicles.filter(v => v.status !== 'retired').map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.reg})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Expense Type</label>
                  <select
                    value={eType}
                    onChange={(e) => setEType(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                    required
                  >
                    <option value="toll">Toll gate fee</option>
                    <option value="insurance">Insurance premium</option>
                    <option value="maintenance">Maintenance log cost</option>
                    <option value="miscellaneous">Miscellaneous expense</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Cost Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={eAmount}
                    onChange={(e) => setEAmount(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Expense Date</label>
                <input
                  type="date"
                  value={eDate}
                  onChange={(e) => setEDate(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton active:scale-[0.95] transition-all cursor-pointer mt-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Log Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6.1 Edit Expense Modal */}
      {showEditExpense && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-hidden">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Edit Expense Record</h3>
              <button onClick={() => setShowEditExpense(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleEditExpenseSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Select Vehicle</label>
                <select
                  value={eVehicleId}
                  onChange={(e) => setEVehicleId(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                  required
                >
                  <option value="">-- Choose --</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.reg})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Expense Type</label>
                  <select
                    value={eType}
                    onChange={(e) => setEType(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:outline-none text-xs cursor-pointer"
                    required
                  >
                    <option value="toll">Toll gate fee</option>
                    <option value="insurance">Insurance premium</option>
                    <option value="maintenance">Maintenance log cost</option>
                    <option value="miscellaneous">Miscellaneous expense</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Cost Amount (₹)</label>
                  <input
                    type="number"
                    value={eAmount}
                    onChange={(e) => setEAmount(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Expense Date</label>
                <input
                  type="date"
                  value={eDate}
                  onChange={(e) => setEDate(e.target.value)}
                  className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton active:scale-[0.95] transition-all cursor-pointer mt-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
