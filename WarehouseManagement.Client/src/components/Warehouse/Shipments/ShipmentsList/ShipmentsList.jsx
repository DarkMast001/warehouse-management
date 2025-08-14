import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notification from '../../../Notification/Notification';
import './ShipmentsList.css'

const ShipmentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [resources, setResources] = useState([]);
  const [measureUnits, setMeasureUnits] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClientName, setSelectedClientName] = useState('');
  const [selectedDocumentNumber, setSelectedDocumentNumber] = useState('');
  const [selectedResourceName, setSelectedResourceName] = useState('');
  const [selectedMeasureUnitName, setSelectedMeasureUnitName] = useState('');

  const [documentNumbers, setDocumentNumbers] = useState([]);

  const navigate = useNavigate();

  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'error'
  });

  const showNotification = (message, type = 'error') => {
    setNotification({
      isVisible: true,
      message,
      type
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };  

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        const filters = {
          documentNumber: null,
          dateFrom: null,
          dateTo: null,
          clientName: null,
          resourceName: null,
          measureUnitName: null
        }

        const [documentsResponse, resourcesResponse, measureUnitsResponse, clientsResponse] = await Promise.all([
          axios.get('https://localhost:7111/shipments/documents-with-resources', {
            params: filters
          }),
          axios.get('https://localhost:7111/resources'),
          axios.get('https://localhost:7111/measureunits'),
          axios.get('https://localhost:7111/clients')
        ]);
        
        const documentsData = documentsResponse.data;
        const resourcesData = resourcesResponse.data;
        const measureUnitsData = measureUnitsResponse.data;
        const clientsData = clientsResponse.data;
        
        setResources(resourcesData);
        setMeasureUnits(measureUnitsData);
        setDocuments(documentsData);
        setClients(clientsData);
        
        setDocumentNumbers(documentsData.map(doc => doc.number));
      } 
      catch (error) {
        console.error(`Ошибка при получении данных:`, error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleDateFromChange = (event) => {
    setDateFrom(event.target.value);
  };

  const handleDateToChange = (event) => {
    setDateTo(event.target.value);
  };

  const handleDocumentNumberChange = (event) => {
    setSelectedDocumentNumber(event.target.value);
  };

  const handleClientChange = (event) => {
    setSelectedClientName(event.target.value);
  }

  const handleResourceChange = (event) => {
    setSelectedResourceName(event.target.value);
  };

  const handleMeasureUnitChange = (event) => {
    setSelectedMeasureUnitName(event.target.value);
  };

  const applyFilters = async () => {
    try {
      setLoading(true);

      const filters = {
        documentNumber: selectedDocumentNumber === "" ? null : selectedDocumentNumber,
        dateFrom: dateFrom === "" ? null : dateFrom,
        dateTo: dateTo === "" ? null : dateTo,
        clientName: selectedClientName === "" ? null : selectedClientName,
        resourceName: selectedResourceName === "" ? null : selectedResourceName,
        measureUnitName: selectedMeasureUnitName === "" ? null : selectedMeasureUnitName
      }
      
      const documentsResponse = await axios.get('https://localhost:7111/shipments/documents-with-resources', { 
        params: filters 
      });
      
      setDocuments(documentsResponse.data);
    } 
    catch (error) {
      console.error(`Ошибка при применении фильтров:`, error);
    }
    finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    try {
      setLoading(true);
      
      setDateFrom('');
      setDateTo('');
      setSelectedClientName('');
      setSelectedDocumentNumber('');
      setSelectedResourceName('');
      setSelectedMeasureUnitName('');

      const filters = {
        documentNumber: null,
        dateFrom: null,
        dateTo: null,
        clientName: null,
        resourceName: null,
        measureUnitName: null
      }
      
      const [documentsResponse, resourcesResponse, measureUnitsResponse, clientsResponse] = await Promise.all([
        axios.get('https://localhost:7111/shipments/documents-with-resources', {
          params: filters
        }),
        axios.get('https://localhost:7111/resources'),
        axios.get('https://localhost:7111/measureunits'),
        axios.get('https://localhost:7111/clients/active')
      ]);
      
      const documentsData = documentsResponse.data;
      const resourcesData = resourcesResponse.data;
      const measureUnitsData = measureUnitsResponse.data;
      const clientsData = clientsResponse.data;
      
      setResources(resourcesData);
      setMeasureUnits(measureUnitsData);
      setDocuments(documentsData);
      setClients(clientsData);
      
      setDocumentNumbers(documentsData.map(doc => doc.number));
    } 
    catch (error) {
      console.error(`Ошибка при сбросе фильтров:`, error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleAddDocument = () => {
    navigate("/shipments/new");
  };

  if (loading && documents.length === 0) {
    return <div className="shipments-list-loading">Загрузка поступлений...</div>;
  }

  return (
    <div className="shipments-list">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="shipments-list-header">
        <h1>Отгрузка</h1>
      </div>

      <div className="shipments-list-filters">
        <div className="shipments-filter-row">
          <div className="shipments-filter-group">
            <label className="shipments-filter-label">
              Дата от:
              <input
                type="date"
                className="shipments-filter-date"
                value={dateFrom}
                onChange={handleDateFromChange}
              />
            </label>
          </div>

          <div className="shipments-filter-group">
            <label className="shipments-filter-label">
              Дата до:
              <input
                type="date"
                className="shipments-filter-date"
                value={dateTo}
                onChange={handleDateToChange}
              />
            </label>
          </div>

          <div className="shipments-filter-group">
            <label className="shipments-filter-label">
              Номер отгрузки:
              <select
                className="shipments-filter-select"
                value={selectedDocumentNumber}
                onChange={handleDocumentNumberChange}
              >
                <option value="">Все номера</option>
                {documentNumbers.map(number => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="shipments-filter-group">
            <label className="shipments-filter-label">
              Клиент:
              <select
                className="shipments-filter-select"
                value={selectedClientName}
                onChange={handleClientChange}
              >
                <option value="">Все клиенты</option>
                {clients.map(client => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="shipments-filter-row">
          <div className="shipments-filter-group">
            <label className="shipments-filter-label">
              Ресурс:
              <select
                className="shipments-filter-select"
                value={selectedResourceName}
                onChange={handleResourceChange}
              >
                <option value="">Все ресурсы</option>
                {resources.map(resource => (
                  <option key={resource.id} value={resource.name}>
                    {resource.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="shipments-filter-group">
            <label className="shipments-filter-label">
              Единица измерения:
              <select
                className="shipments-filter-select"
                value={selectedMeasureUnitName}
                onChange={handleMeasureUnitChange}
              >
                <option value="">Все единицы измерения</option>
                {measureUnits.map(unit => (
                  <option key={unit.id} value={unit.name}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="shipments-filter-actions">
          <button className="btn btn-apply-to-work" onClick={applyFilters}>Применить</button>
          <button className="btn btn-cancel" onClick={resetFilters}>Сбросить</button>
          <button className="btn btn-add-save" onClick={handleAddDocument}>Добавить</button>
        </div>
      </div>

      <div className="shipments-list-table-container">
        <table className="shipments-list-table">
          <thead>
            <tr>
              <th>Номер документа</th>
              <th>Дата документа</th>
              <th>Клиент</th>
              <th>Статус</th>
              <th>Ресурсы</th>
              <th>Единицы измерения</th>
              <th>Количество</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id} className="shipment-list-row">
                <td>
                  <Link to={`/shipments/${document.id}`} className="item-link">
                    {document.number}
                  </Link>
                  </td>
                <td>
                  {new Date(document.date).toLocaleDateString('ru-RU')}
                </td>
                <td>
                  {document.clientName}
                </td>
                <td>
                  <div className="shipment-status-cell"
                    style={{
                      backgroundColor: document.status === 'SIGNED' ? '#27ae60' : '#7f8c8d'
                    }}
                  >
                    {document.status === 'SIGNED' ? 'Подписан' : 'Не подписан'}
                  </div>
                </td>
                <td>
                  <div className="shipments-multi-line-cell">
                    {document.resources && document.resources.length > 0 ? (
                      document.resources.map((resource, index) => (
                        <div key={`${resource.id}-${index}`} className="shipments-resource-item">
                          {resource.name}
                        </div>
                      ))
                    ) : (
                      <div className="shipments-empty-cell">Нет ресурсов</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="shipments-multi-line-cell">
                    {document.resources && document.resources.length > 0 ? (
                      document.resources.map((resource, index) => (
                        <div key={`${resource.id}-${index}`} className="shipments-measure-unit-item">
                          {resource.measureUnitName}
                        </div>
                      ))
                    ) : (
                      <div className="shipments-empty-cell">Нет единиц</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="shipments-multi-line-cell">
                    {document.resources && document.resources.length > 0 ? (
                      document.resources.map((resource, index) => (
                        <div key={`${resource.id}-${index}`} className="shipments-quantity-item">
                          {resource.quantity}
                        </div>
                      ))
                    ) : (
                      <div className="shipments-empty-cell">0</div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ShipmentsList;