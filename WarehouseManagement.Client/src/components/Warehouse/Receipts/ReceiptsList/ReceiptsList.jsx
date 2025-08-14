import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../../apiClient';
import Notification from '../../../Notification/Notification';
import './ReceiptsList.css';

const Receipts = () => {
  const [documents, setDocuments] = useState([]);
  const [resources, setResources] = useState([]);
  const [measureUnits, setMeasureUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
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
          resourceName: null,
          measureUnitName: null
        }

        const [documentsResponse, resourcesResponse, measureUnitsResponse] = await Promise.all([
          apiClient.get('/receipts/documents-with-resources', {
            params: filters
          }),
          apiClient.get('/resources'),
          apiClient.get('/measureunits')
        ]);
        
        const documentsData = documentsResponse.data;
        const resourcesData = resourcesResponse.data;
        const measureUnitsData = measureUnitsResponse.data;
        
        setResources(resourcesData);
        setMeasureUnits(measureUnitsData);
        setDocuments(documentsData);
        
        setDocumentNumbers(documentsData.map(doc => doc.number));
      } 
      catch (error) {
        console.error('Ошибка при получении данных:', error);
      }
      finally{
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
        resourceName: selectedResourceName === "" ? null : selectedResourceName,
        measureUnitName: selectedMeasureUnitName === "" ? null : selectedMeasureUnitName
      }
      
      const documentsResponse = await apiClient.get('/receipts/documents-with-resources', { 
        params: filters 
      });
      
      setDocuments(documentsResponse.data);
    } 
    catch (error) {
      console.error('Ошибка при применении фильтров:', error);
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
      setSelectedDocumentNumber('');
      setSelectedResourceName('');
      setSelectedMeasureUnitName('');

      const filters = {
        documentNumber: null,
        dateFrom: null,
        dateTo: null,
        resourceName: null,
        measureUnitName: null
      }
      
      const [documentsResponse, resourcesResponse, measureUnitsResponse] = await Promise.all([
        apiClient.get('/receipts/documents-with-resources', {
          params: filters
        }),
        apiClient.get('/resources'),
        apiClient.get('/measureunits')
      ]);
      
      const documentsData = documentsResponse.data;
      const resourcesData = resourcesResponse.data;
      const measureUnitsData = measureUnitsResponse.data;
      
      setResources(resourcesData);
      setMeasureUnits(measureUnitsData);
      setDocuments(documentsData);
      
      setDocumentNumbers(documentsData.map(doc => doc.number));
    } 
    catch (error) {
      console.error('Ошибка при сбросе фильтров:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleAddDocument = () => {
    navigate("/receipts/new");
  };

  if (loading && documents.length === 0) {
    return <div className="receipts-list-loading">Загрузка поступлений...</div>;
  }

  return (
    <div className="receipts-list">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="receipts-list-header">
        <h1>Поступления</h1>
      </div>

      <div className="receipts-list-filters">
        <div className="receipts-filter-row">
          <div className="receipts-filter-group">
            <label className="receipts-filter-label">
              Дата от:
              <input
                type="date"
                className="receipts-filter-date"
                value={dateFrom}
                onChange={handleDateFromChange}
              />
            </label>
          </div>

          <div className="receipts-filter-group">
            <label className="receipts-filter-label">
              Дата до:
              <input
                type="date"
                className="receipts-filter-date"
                value={dateTo}
                onChange={handleDateToChange}
              />
            </label>
          </div>

          <div className="receipts-filter-group">
            <label className="receipts-filter-label">
              Номер поступления:
              <select
                className="receipts-filter-select"
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
        </div>

        <div className="receipts-filter-row">
          <div className="receipts-filter-group">
            <label className="receipts-filter-label">
              Ресурс:
              <select
                className="receipts-filter-select"
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

          <div className="receipts-filter-group">
            <label className="receipts-filter-label">
              Единица измерения:
              <select
                className="receipts-filter-select"
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

        <div className="receipts-filter-actions">
          <button className="btn btn-apply-to-work" onClick={applyFilters}>Применить</button>
          <button className="btn btn-cancel" onClick={resetFilters}>Сбросить</button>
          <button to="/receipts/new" className="btn btn-add-save" onClick={handleAddDocument}>Добавить</button>
        </div>
      </div>

      <div className="receipts-list-table-container">
        <table className="receipts-list-table">
          <thead>
            <tr>
              <th>Номер документа</th>
              <th>Дата документа</th>
              <th>Ресурсы</th>
              <th>Единицы измерения</th>
              <th>Количество</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id} className="receipt-list-row">
                <td>
                  <Link to={`/receipts/${document.id}`} className="item-link">
                    {document.number}
                  </Link>
                  </td>
                <td>{new Date(document.date).toLocaleDateString('ru-RU')}</td>
                <td>
                  <div className="receipts-multi-line-cell">
                    {document.resources && document.resources.length > 0 ? (
                      document.resources.map((resource, index) => (
                        <div key={`${resource.id}-${index}`} className="receipts-resource-item">
                          {resource.name}
                        </div>
                      ))
                    ) : (
                      <div className="receipts-empty-cell">Нет ресурсов</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="receipts-multi-line-cell">
                    {document.resources && document.resources.length > 0 ? (
                      document.resources.map((resource, index) => (
                        <div key={`${resource.id}-${index}`} className="receipts-measure-unit-item">
                          {resource.measureUnitName}
                        </div>
                      ))
                    ) : (
                      <div className="receipts-empty-cell">Нет единиц</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="receipts-multi-line-cell">
                    {document.resources && document.resources.length > 0 ? (
                      document.resources.map((resource, index) => (
                        <div key={`${resource.id}-${index}`} className="receipts-quantity-item">
                          {resource.quantity}
                        </div>
                      ))
                    ) : (
                      <div className="receipts-empty-cell">0</div>
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
};

export default Receipts;