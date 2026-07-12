import React, { useState, useEffect } from 'react';
import GPSCard from '../components/GPSTracking';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut, Plus, Search, Truck, Users, Calendar,
  Settings, LayoutGrid, Wrench, Shield, Check, Info, AlertTriangle,
  Play, Sparkles, MapPin, Gauge, Fuel, Thermometer, ArrowRight, X, UserPlus,
  TrendingUp, CircleDollarSign, Download
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

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTypeVeh, setFilterTypeVeh] = useState('all');

  // Selected details panel
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Modals state
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showDispatchTrip, setShowDispatchTrip] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

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

  // Form states - Maintenance
  const [mVehicleId, setMVehicleId] = useState('');
  const [mIssue, setMIssue] = useState('');
  const [mCost, setMCost] = useState('');

  // Form states - Expense
  const [eVehicleId, setEVehicleId] = useState('');
  const [eType, setEType] = useState('fuel');
  const [eAmount, setEAmount] = useState('');
  const [eLiters, setELiters] = useState('');

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

  // Form submit handlers
  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
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
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowAddVehicle(false);
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
        fetchData();
      } else {
        setSubmitError(data.message || 'Error adding vehicle');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
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
          status: 'dispatched',
          revenue: Math.floor(Number(tDistance) * 4.5)
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowDispatchTrip(false);
        setTSource(''); setTDest(''); setTVehicleId(''); setTDriverId(''); setTWeight(''); setTDistance('');
        fetchData();
      } else {
        setSubmitError(data.message || 'Error dispatching trip');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
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

  const handleExpenseSubmit = async (e) => {
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
          liters: eType === 'fuel' ? Number(eLiters) : 0
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowExpenseModal(false);
        setEVehicleId(''); setEAmount(''); setELiters('');
        fetchData();
      } else {
        setSubmitError(data.message || 'Error adding expense');
      }
    } catch (err) {
      setSubmitError('Server connection failure');
    }
  };

  const handleProgressTrip = async (tripId, currentStage) => {
    const nextStage = currentStage === 'dispatched' ? 'completed' : 'cancelled';
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
      }
    } catch (err) {
      console.error(err);
    }
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

  // CSV Export utility
  const handleExportCSV = () => {
    if (reports.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Registration,Model,Type,Status,Acquisition Cost,Total Fuel Cost,Total Maintenance Cost,Total Revenue,Distance Traveled,Fuel Efficiency (KM/L),ROI (%)\n";

    reports.forEach(r => {
      csvContent += `${r.reg},${r.name},${r.type},${r.status},${r.acquisitionCost},${r.fuelCost},${r.maintenanceCost},${r.revenue},${r.distanceTraveled},${r.fuelEfficiency},${(r.roi * 100).toFixed(2)}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_operations_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Sidebar Navigation - Fixed height sticky design to prevent stretching */}
      <aside className={`h-full bg-white/60 backdrop-blur-xl border-white/80 flex flex-col justify-between hidden md:flex flex-shrink-0 relative z-10 transition-all duration-300 ${sidebarVisible ? 'w-72 p-8 border-r-2 opacity-100' : 'w-0 p-0 border-r-0 opacity-0 overflow-hidden pointer-events-none'
        }`}>
        <div className="space-y-12">
          {/* Logo container */}
          <div className="flex items-center gap-3">
            <img src={logo} className="w-10 h-10 object-contain rounded-2xl shadow-clayButton" alt="TransitOps" />
            <span className="font-black text-2xl tracking-tight text-clay-foreground uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>TransitOps</span>
          </div>

          {/* Nav list */}
          <nav className="flex flex-col gap-3">
            {[
              { id: 'overview', icon: LayoutGrid, label: 'Overview' },
              { id: 'vehicles', icon: Truck, label: 'Vehicles Registry' },
              { id: 'drivers', icon: Users, label: 'Driver Crew' },
              { id: 'schedule', icon: Calendar, label: 'Dispatch Log' },
              { id: 'maintenance', icon: Wrench, label: 'Maintenance Log' },
              { id: 'reports', icon: TrendingUp, label: 'Reports & ROI' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveMenu(item.id); setSearchQuery(''); }}
                  className={`flex items-center gap-4 px-6 py-4 rounded-[20px] font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer ${isActive
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
        </div>

        {/* User Profile Card & Signout */}
        <div className="space-y-6">
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
          {['overview', 'vehicles', 'drivers', 'schedule', 'maintenance', 'reports'].map(tab => (
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
                {activeMenu === 'reports' && 'Reports & Analytics'}
              </h1>
              <p className="text-clay-muted font-medium text-sm md:text-base mt-1">
                Active operations pipeline monitor.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white px-4 py-2 rounded-full shadow-clayCard text-xs font-bold font-mono tracking-wide text-clay-primary flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>ROLE: {user ? user.role.toUpperCase().replace('_', ' ') : 'FLEET MANAGER'}</span>
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
                  onClick={() => { setSubmitError(''); setShowExpenseModal(true); }}
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
                  onClick={() => { setSubmitError(''); setShowAddVehicle(true); }}
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
                  onClick={() => { setSubmitError(''); setShowAddVehicle(true); }}
                  className="bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white font-bold text-xs px-5 py-3.5 rounded-[20px] shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none uppercase tracking-wider cursor-pointer"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  <Plus className="w-4 h-4 font-black" />
                  <span>Add Vehicle</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${selectedVehicle ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                {filteredVehicles.map(veh => (
                  <div
                    key={veh._id}
                    onClick={() => setSelectedVehicle(veh)}
                    className={`bg-white rounded-[32px] p-6 shadow-clayCard border flex flex-col justify-between gap-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${selectedVehicle?._id === veh._id ? 'border-clay-primary ring-2 ring-clay-primary/20' : 'border-white/60'
                      }`}
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
                        <span className="font-mono text-[9px] font-bold text-clay-muted uppercase truncate tracking-wider">{trip.driver?.name}</span>
                      </div>
                      <h4 className="font-headline font-black text-base text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>
                        {trip.source} ➜ {trip.destination}
                      </h4>
                      <p className="text-[10px] text-clay-muted font-bold uppercase tracking-wider">VEHICLE: {trip.vehicle?.name} ({trip.vehicle?.reg})</p>
                      <p className="text-[10px] text-clay-muted font-bold uppercase tracking-wider">WEIGHT: {trip.weight} Tons | DISTANCE: {trip.distance} KM</p>
                    </div>

                    <div className="flex-1 max-w-lg flex items-center justify-between gap-2.5 relative">
                      {[
                        { label: 'Draft', val: 'draft' },
                        { label: 'Dispatched', val: 'dispatched' },
                        { label: 'Completed', val: 'completed' }
                      ].map((step, idx) => {
                        const stages = ['draft', 'dispatched', 'completed', 'cancelled'];
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

                    <div className="flex items-center gap-2">
                      {trip.status === 'dispatched' && (
                        <>
                          <button
                            onClick={() => handleProgressTrip(trip._id, 'dispatched')}
                            className="bg-white hover:bg-slate-50 border border-white/60 text-clay-primary font-bold text-xs px-4 py-2.5 rounded-[20px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                            style={{ fontFamily: "Nunito, sans-serif" }}
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleProgressTrip(trip._id, 'cancelled')}
                            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs px-4 py-2.5 rounded-[20px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider cursor-pointer"
                            style={{ fontFamily: "Nunito, sans-serif" }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {trip.status === 'completed' && (
                        <span className="bg-clay-success/15 text-clay-success px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-clay-success/20">
                          Completed
                        </span>
                      )}
                      {trip.status === 'cancelled' && (
                        <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-red-200">
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
          <div className="space-y-10">
            <div className="flex justify-between items-center bg-white/40 p-4 rounded-[24px] border border-white/40 shadow-clayCard">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Operations reports</h3>

              <button
                onClick={handleExportCSV}
                className="bg-[#EFEBF5] hover:bg-white text-clay-primary border border-white/60 font-bold text-xs px-5 py-3 rounded-[20px] shadow-clayCard active:scale-[0.95] transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Visual Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[32px] p-8 shadow-clayCard border border-white/60">
                <h3 className="font-headline text-2xl font-black uppercase mb-6 text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Vehicle ROI (%)</h3>
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
                <h3 className="font-headline text-2xl font-black uppercase mb-6 text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Fuel Efficiency (KM/L)</h3>
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

            {/* Data Grid */}
            <div className="bg-white rounded-[32px] p-8 shadow-clayCard border border-white/60 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 font-mono text-[9px] uppercase tracking-wider text-clay-muted">
                    <th className="pb-4">Vehicle</th>
                    <th className="pb-4">Acquisition Cost</th>
                    <th className="pb-4">Fuel Cost</th>
                    <th className="pb-4">Maintenance</th>
                    <th className="pb-4">Total Ops Cost</th>
                    <th className="pb-4">Revenue</th>
                    <th className="pb-4">Distance</th>
                    <th className="pb-4">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-xs">
                  {reports.map(r => (
                    <tr key={r.vehicleId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-headline uppercase" style={{ fontFamily: "Nunito, sans-serif" }}>{r.name} ({r.reg})</td>
                      <td className="py-4 text-clay-muted">₹{r.acquisitionCost.toLocaleString()}</td>
                      <td className="py-4 text-clay-muted">₹{r.fuelCost.toLocaleString()}</td>
                      <td className="py-4 text-clay-muted">₹{r.maintenanceCost.toLocaleString()}</td>
                      <td className="py-4 text-clay-secondary">₹{r.totalOperationalCost.toLocaleString()}</td>
                      <td className="py-4 text-clay-success">₹{r.revenue.toLocaleString()}</td>
                      <td className="py-4 text-clay-muted">{r.distanceTraveled} KM</td>
                      <td className={`py-4 ${(r.roi >= 0) ? 'text-clay-primary' : 'text-red-500'}`}>
                        {(r.roi * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================
         MODALS
         ======================================================== */}

      {/* 1. Add Vehicle Modal - Expanded with collaborator fields */}
      {showAddVehicle && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-hidden flex flex-col max-h-[90vh]">

            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Register Vehicle</h3>
              <button onClick={() => setShowAddVehicle(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
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

                            {/* Styled File Upload Input */}
                            <div className="flex flex-col space-y-1">
                              <label className="font-mono text-[8px] font-black uppercase tracking-wider text-clay-muted">Document File</label>
                              <div className="relative w-full h-10 bg-[#EFEBF5] rounded-[16px] shadow-clayPressed flex items-center justify-between px-3 cursor-pointer hover:bg-white transition-all overflow-hidden border border-transparent focus-within:border-clay-primary/20">
                                <span className="text-[10px] text-clay-foreground font-semibold truncate pr-4">
                                  {doc.file ? doc.file : 'Select file (PDF/Image)'}
                                </span>
                                <span className="bg-clay-primary text-white text-[9px] font-bold px-3 py-1 rounded-[10px] uppercase tracking-wider cursor-pointer shadow-clayButton">
                                  Choose
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      doc.setFile(e.target.files[0].name);
                                    }
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                              </div>
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
                Register Vehicle
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
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-hidden">

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

      {/* 5. Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-[#332F3A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-claySurface border border-white/80 relative z-50 overflow-hidden">

            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-headline text-2xl font-black uppercase text-clay-foreground" style={{ fontFamily: "Nunito, sans-serif" }}>Log Fuel / Operational Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-clay-muted hover:text-clay-foreground font-black text-sm uppercase tracking-wider cursor-pointer">Close</button>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 mb-4 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono text-[10px] font-bold text-red-600 leading-normal uppercase">{submitError}</span>
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
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
                    <option value="fuel">Fuel Log</option>
                    <option value="toll">Toll Gate</option>
                    <option value="other">Other Expense</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Cost Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 350"
                    value={eAmount}
                    onChange={(e) => setEAmount(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
              </div>

              {eType === 'fuel' && (
                <div className="flex flex-col space-y-1">
                  <label className="font-mono text-[9px] font-black uppercase tracking-wider text-clay-muted">Fuel Liters Logged</label>
                  <input
                    type="number"
                    placeholder="e.g. 80"
                    value={eLiters}
                    onChange={(e) => setELiters(e.target.value)}
                    className="bg-[#EFEBF5] border-0 text-clay-foreground font-semibold px-4 py-2.5 rounded-[16px] shadow-clayPressed focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-primary/10 transition-all text-xs"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white py-3.5 rounded-[20px] font-mono text-xs font-bold uppercase tracking-widest shadow-clayButton hover:shadow-[14px_14px_28px_rgba(139,92,246,0.35)] active:scale-[0.95] active:shadow-clayPressed transition-all cursor-pointer mt-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Save Expense Log
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
