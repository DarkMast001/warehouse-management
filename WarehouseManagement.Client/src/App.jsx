import React from 'react';
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
            <Route path="/" element={<ResourcesList />} />

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
          </Routes>
        </div>
      </div>
    </Router>
  )
}
