import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Sidebar from './components/Sidebar/Sidebar';

import ClientsList from './components/Items/Clients/ClientsList/ClientsList';
import ClientDetails from './components/Items/Clients/ClientDetails/ClientDetails';
import AddClient from './components/Items/Clients/AddClient/AddClient';
import ArchivedClients from './components/Items/Clients/ArchivedClients/ArchivedClients';

import ResourcesList from './components/Items/Resources/ResourcesList/ResourcesList';
import AddResource from './components/Items/Resources/AddResource/AddResource';
import ArchivedResources from './components/Items/Resources/ArchivedResources/ArchivedResources';
import ResourceDetails from './components/Items/Resources/ResourceDetails/ResourceDetails';

import MeasureUnitsList from './components/Items/MeasureUnits/MeasureUnitsList/MeasureUnitsList';
import AddMeasureUnit from './components/Items/MeasureUnits/AddMeasureUnit/AddMeasureUnit';
import ArchivedMeasureUnits from './components/Items/MeasureUnits/ArchivedMeasureUnits/ArchivedMeasureUnits';
import MeasureUnitDetails from './components/Items/MeasureUnits/MeasureUnitDetails/MeasureUnitDetails';

import Balance from './components/Warehouse/Balance/Balance';

import ReceiptsList from './components/Warehouse/Receipts/ReceiptsList/ReceiptsList';
import AddReceipt from './components/Warehouse/Receipts/AddReceipt/AddReceipt';
import ReceiptDetails from './components/Warehouse/Receipts/ReceiptDetails/ReceiptDetails';

import ShipmentsList from './components/Warehouse/Shipments/ShipmentsList/ShipmentsList';
import AddShipment from './components/Warehouse/Shipments/AddShipment/AddShipment';
import ShipmentDetails from './components/Warehouse/Shipments/ShipmentDetails/ShipmentDetails';

import Notification from './components/Notification/Notification';

import './App.css';
import './components/Items/CommonItemListStyle.css';
import './components/Items/CommonItemDetailsStyle.css';
import './components/Items/CommonItemArchivedStyle.css';
import './components/Items/CommonItemAddStyle.css';

export default function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Balance />} />

            <Route path="/clients" element={<ClientsList />} />
            <Route path="/clients/new" element={<AddClient />} />
            <Route path="/clients/archived" element={<ArchivedClients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            
            <Route path="/resources" element={<ResourcesList />} />
            <Route path="/resources/new" element={<AddResource />} />
            <Route path="/resources/archived" element={<ArchivedResources />} />
            <Route path="/resources/:id" element={<ResourceDetails />} />

            <Route path="/measureunits" element={<MeasureUnitsList />} />
            <Route path="/measureunits/new" element={<AddMeasureUnit />} />
            <Route path="/measureunits/archived" element={<ArchivedMeasureUnits />} />
            <Route path="/measureunits/:id" element={<MeasureUnitDetails />} />

            <Route path="/balance" element={<Balance />} />
            
            <Route path="/receipts" element={<ReceiptsList />} />
            <Route path="/receipts/new" element={<AddReceipt />} />
            <Route path="/receipts/:id" element={<ReceiptDetails />} />

            <Route path="/shipments" element={<ShipmentsList />} />
            <Route path="/shipments/new" element={<AddShipment />} />
            <Route path="/shipments/:id" element={<ShipmentDetails />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};
