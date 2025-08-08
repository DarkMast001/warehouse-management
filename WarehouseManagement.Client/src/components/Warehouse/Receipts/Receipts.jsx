import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Receipts.css';

const Receipts = () => {
  const [documents, setDocuments] = useState([]);
  const [resources, setResources] = useState([]);
  const [measureUnits, setMeasureUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedDocumentNumber, setSelectedDocumentNumber] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [selectedMeasureUnitId, setSelectedMeasureUnitId] = useState('');

  const [documentNumbers, setDocumentNumbers] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        const [resourcesResponse, measureUnitsResponse] = await Promise.all([
          axios.get('https://localhost:7111/resources'),
          axios.get('https://localhost:7111/measureunits')
        ]);
        
        const resourcesData = resourcesResponse.data;
        const measureUnitsData = measureUnitsResponse.data;
        
        setResources(resourcesData);
        setMeasureUnits(measureUnitsData);
        
        const documentsResponse = await axios.get('https://localhost:7111/receipts/documents');
        const documentsData = documentsResponse.data;
        
        const uniqueNumbers = [...new Set(documentsData.map(doc => doc.number))];
        setDocumentNumbers(uniqueNumbers.sort((a, b) => a - b));
        
        const formattedDocuments = await loadAndFormatDocuments(documentsData, resourcesData, measureUnitsData);
        
        setDocuments(formattedDocuments);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const getDocumentResources = async (documentId) => {
    try {
      const response = await axios.get(`https://localhost:7111/receipts/resourcesindocument/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении ресурсов документа:', error);
      return [];
    }
  };

  const formatResourcesWithNames = (resourcesData, resourcesList, measureUnitsList) => {
    const resourceMap = {};
    const measureUnitMap = {};
    
    resourcesList.forEach(resource => {
      resourceMap[resource.id] = resource.name;
    });
    
    measureUnitsList.forEach(unit => {
      measureUnitMap[unit.id] = unit.name;
    });
    
    return resourcesData.map(resource => ({
      ...resource,
      resourceName: resourceMap[resource.resourceId] || 'Не указан',
      measureUnitName: measureUnitMap[resource.measureUnitId] || 'Не указана'
    }));
  };

  const loadAndFormatDocuments = async (documentsData, resourcesData, measureUnitsData) => {
    try {
      const documentsWithResources = await Promise.all(
        documentsData.map(async (doc) => {
          const resourcesForDoc = await getDocumentResources(doc.id);
          return {
            ...doc,
            receiptResources: resourcesForDoc,
          };
        })
      );
      
      const formattedDocuments = documentsWithResources.map((doc) => ({
        ...doc,
        receiptResources: formatResourcesWithNames(doc.receiptResources, resourcesData, measureUnitsData),
      }));
      
      return formattedDocuments;
    } catch (error) {
      console.error('Ошибка при загрузке и форматировании документов:', error);
      return documentsData.map(doc => ({ ...doc, receiptResources: [] }));
    }
  };

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
    setSelectedResourceId(event.target.value);
  };

  const handleMeasureUnitChange = (event) => {
    setSelectedMeasureUnitId(event.target.value);
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      
      // Здесь будет ваш запрос к API с фильтрами
      // Пока используем заглушку
      console.log('Фильтры:', {
        dateFrom: dateFrom || "",
        dateTo: dateTo || "",
        documentNumber: selectedDocumentNumber ? parseInt(selectedDocumentNumber) : "",
        resourceId: selectedResourceId || "",
        measureUnitId: selectedMeasureUnitId || ""
      });
      
      // Симулируем фильтрацию на клиенте
      let filteredDocuments = [...documents];
      
      if (dateFrom) {
        filteredDocuments = filteredDocuments.filter(doc => new Date(doc.date) >= new Date(dateFrom));
      }
      
      if (dateTo) {
        filteredDocuments = filteredDocuments.filter(doc => new Date(doc.date) <= new Date(dateTo));
      }
      
      if (selectedDocumentNumber) {
        const number = parseInt(selectedDocumentNumber);
        filteredDocuments = filteredDocuments.filter(doc => doc.number === number);
      }
      
      if (selectedResourceId) {
        filteredDocuments = filteredDocuments.filter(doc =>
          doc.receiptResources.some(resource => resource.resourceId === selectedResourceId)
        );
      }
      
      if (selectedMeasureUnitId) {
        filteredDocuments = filteredDocuments.filter(doc =>
          doc.receiptResources.some(resource => resource.measureUnitId === selectedMeasureUnitId)
        );
      }
      
      setDocuments(filteredDocuments);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при применении фильтров:', error);
      setLoading(false);
    }
  };

  // Сбросить фильтры
  const resetFilters = async () => {
    try {
      setLoading(true);
      
      // Сбрасываем фильтры
      setDateFrom('');
      setDateTo('');
      setSelectedDocumentNumber('');
      setSelectedResourceId('');
      setSelectedMeasureUnitId('');
      
      // Загружаем все документы заново
      const [documentsResponse, resourcesResponse, measureUnitsResponse] = await Promise.all([
        axios.get('https://localhost:7111/receipts/documents'),
        axios.get('https://localhost:7111/resources'),
        axios.get('https://localhost:7111/measureunits')
      ]);
      
      const documentsData = documentsResponse.data;
      const resourcesData = resourcesResponse.data;
      const measureUnitsData = measureUnitsResponse.data;
      
      // Обновляем справочные данные
      setResources(resourcesData);
      setMeasureUnits(measureUnitsData);
      
      // Получаем уникальные номера документов
      const uniqueNumbers = [...new Set(documentsData.map(doc => doc.number))];
      setDocumentNumbers(uniqueNumbers.sort((a, b) => a - b));
      
      // Загружаем и форматируем документы
      const formattedDocuments = await loadAndFormatDocuments(documentsData, resourcesData, measureUnitsData);
      
      setDocuments(formattedDocuments);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при сбросе фильтров:', error);
      setLoading(false);
    }
  };

  // Добавить документ (заглушка)
  const handleAddDocument = () => {
    alert('Функция добавления документа будет реализована позже');
  };

  if (loading && documents.length === 0) {
    return <div className="receipts-loading">Загрузка поступлений...</div>;
  }

  return (
    <div className="receipts">
      <div className="receipts-header">
        <h1>Поступления</h1>
      </div>

      {/* Фильтры */}
      <div className="receipts-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">
              Дата от:
              <input
                type="date"
                className="filter-date"
                value={dateFrom}
                onChange={handleDateFromChange}
              />
            </label>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              Дата до:
              <input
                type="date"
                className="filter-date"
                value={dateTo}
                onChange={handleDateToChange}
              />
            </label>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              Номер документа:
              <select
                className="filter-select"
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

        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">
              Ресурс:
              <select
                className="filter-select"
                value={selectedResourceId}
                onChange={handleResourceChange}
              >
                <option value="">Все ресурсы</option>
                {resources.map(resource => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              Единица измерения:
              <select
                className="filter-select"
                value={selectedMeasureUnitId}
                onChange={handleMeasureUnitChange}
              >
                <option value="">Все единицы измерения</option>
                {measureUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Кнопки фильтров */}
        <div className="filter-actions">
          <button className="btn btn-apply-to-work" onClick={applyFilters}>Применить</button>
          <button className="btn btn-cancel" onClick={resetFilters}>Сбросить</button>
          <button className="btn btn-add-save" onClick={handleAddDocument}>Добавить</button>
        </div>
      </div>

      {/* Таблица документов */}
      <div className="receipts-table-container">
        <table className="receipts-table">
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
              <tr key={document.id} className="receipt-row">
                <td>{document.number}</td>
                <td>{new Date(document.date).toLocaleDateString('ru-RU')}</td>
                <td>
                  <div className="multi-line-cell">
                    {document.receiptResources && document.receiptResources.length > 0 ? (
                      document.receiptResources.map((resource, index) => (
                        <div key={`${resource.id}-${index}`} className="resource-item">
                          {resource.resourceName}
                        </div>
                      ))
                    ) : (
                      <div className="empty-cell">Нет ресурсов</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="multi-line-cell">
                    {document.receiptResources && document.receiptResources.length > 0 ? (
                      document.receiptResources.map((resource, index) => (
                        <div key={`${resource.id}-${index}`} className="measure-unit-item">
                          {resource.measureUnitName}
                        </div>
                      ))
                    ) : (
                      <div className="empty-cell">Нет единиц</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="multi-line-cell">
                    {document.receiptResources && document.receiptResources.length > 0 ? (
                      document.receiptResources.map((resource, index) => (
                        <div key={`${resource.id}-${index}`} className="quantity-item">
                          {resource.quantity}
                        </div>
                      ))
                    ) : (
                      <div className="empty-cell">0</div>
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