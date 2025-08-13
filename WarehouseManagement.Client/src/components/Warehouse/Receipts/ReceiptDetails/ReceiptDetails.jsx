import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notification from '../../../Notification/Notification';
import './ReceiptDetails.css'

const ReceiptDetails = () => {
	const navigate = useNavigate();

  const { id } = useParams();

  const [document, setDocument] = useState([]);
  const [resources, setResources] = useState([]);
  const [measureUnits, setMeasureUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [receiptResources, setReceiptResources] = useState([]);
  
  const [newResource, setNewResource] = useState({
    resourceId: '',
    measureUnitId: '',
    quantity: ''
  });

  const ResourceStatus = {
    New: 'New',
    NotChanged: 'NotChanged',
    Deleted: 'Deleted'
  }

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
        
        const [documentResponce, resourcesResponse, measureUnitsResponse] = await Promise.all([
          axios.get(`https://localhost:7111/receipts/documents/${id}`),
          axios.get('https://localhost:7111/resources/active'),
          axios.get('https://localhost:7111/measureunits/active')
        ]);
        
        setDocument(documentResponce.data);
        setResources(resourcesResponse.data);
        setMeasureUnits(measureUnitsResponse.data);

        setDocumentNumber(documentResponce.data[0].number);
        setDocumentDate(documentResponce.data[0].date);

        const resourcesWithDeleteFlag = documentResponce.data[0].resources.map(resource => ({
          ...resource,
          status: ResourceStatus.NotChanged
        }));
        setReceiptResources(resourcesWithDeleteFlag);
      } 
      catch (error) {
        console.error('Ошибка при получении данных:', error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleDocumentNumberChange = (event) => {
    setDocumentNumber(event.target.value);
  };

  const handleDocumentDateChange = (event) => {
    setDocumentDate(event.target.value);
  };

  const handleResourceChange = (event) => {
    setNewResource(prev => ({
      ...prev,
      resourceId: event.target.value
    }));
  };

  const handleMeasureUnitChange = (event) => {
    setNewResource(prev => ({
      ...prev,
      measureUnitId: event.target.value
    }));
  };

  const handleQuantityChange = (event) => {
    setNewResource(prev => ({
      ...prev,
      quantity: event.target.value
    }));
  };

  const addResourceToTable = () => {
    if (!newResource.resourceId || !newResource.measureUnitId || !newResource.quantity) {
      showNotification('Пожалуйста, заполните все поля ресурса');
      return;
    }

    const quantity = parseFloat(newResource.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      showNotification('Количество должно быть положительным числом');
      return;
    }

    const resource = resources.find(r => r.id === newResource.resourceId);
    const measureUnit = measureUnits.find(m => m.id === newResource.measureUnitId);

    const resourceToAdd = {
      id: Date.now().toString(),
      resourceId: newResource.resourceId,
      name: resource ? resource.name : 'Не найден',
      measureUnitId: newResource.measureUnitId,
      measureUnitName: measureUnit ? measureUnit.name : 'Не найдена',
      quantity: quantity,
      status: ResourceStatus.New
    };

    setReceiptResources(prev => [...prev, resourceToAdd]);
    
    setNewResource({
      resourceId: '',
      measureUnitId: '',
      quantity: ''
    });
  };

  const removeResourceFromTable = (resourceId) => {
    setReceiptResources(prev => 
      prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, status: ResourceStatus.Deleted } 
          : resource
      )
    );
  };

  const handleSubmit = async () => {
  try {
    if (!documentNumber) {
      showNotification('Пожалуйста, введите номер документа');
      return;
    }

    if (!documentDate) {
      showNotification('Пожалуйста, введите дату документа');
      return;
    }

    const number = parseInt(documentNumber);
    if (isNaN(number) || number <= 0) {
      showNotification('Номер документа должен быть положительным числом');
      return;
    }

    setLoading(true);

    const resourceIds = [];
    for (const resource of receiptResources) {

      if (resource.status === ResourceStatus.New){
        const resourceData = {
          resourceId: resource.resourceId,
          measureUnitId: resource.measureUnitId,
          quantity: resource.quantity
        };
        
        const resourceResponse = await axios.post('https://localhost:7111/receipts/resources', resourceData);
        resourceIds.push(resourceResponse.data);
      }
      else if (resource.status === ResourceStatus.Deleted) {
        await axios.delete(`https://localhost:7111/receipts/resources/${resource.id}`);
      }
    }

    const documentData = {
      newNumber: number,
      newDate: documentDate,
      newReceiptResourceIds: resourceIds
    };

    await axios.put(`https://localhost:7111/receipts/documents/${id}`, documentData);

    navigate('/receipts');
  } 
  catch (error) {
    if (error.status == 409) {
      showNotification('Документ с таким номером уже существует!');
    }
    else {
      console.error('Ошибка при обновлении документа:', error);
      showNotification('Ошибка при обновлении документа: ' + (error.response?.data?.message || error.message));
    }
  }
  finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    navigate('/receipts');
  };

  const handleDelete = async () => {
    await axios.delete(`https://localhost:7111/receipts/documents/${id}`);
    navigate('/receipts');
  }

  if (loading) {
    return <div className="add-receipt-loading">Загрузка данных...</div>;
  }

  return (
    <div className="add-receipt">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="add-receipt-header">
        <h1>Добавить документ поступления</h1>
      </div>

      <div className="document-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Номер документа *</label>
            <input
              type="number"
              className="form-input"
              value={documentNumber}
              onChange={handleDocumentNumberChange}
              placeholder="Введите номер документа"
              min="1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Дата документа *</label>
            <input
              type="date"
              className="form-input"
              value={documentDate}
              onChange={handleDocumentDateChange}
            />
          </div>
        </div>
      </div>

      <div className="resources-section">
        <h2>Ресурсы документа</h2>
        
        <div className="new-resource-form">
          <div className="resource-row new-resource-row">
            <div className="resource-cell">
              <button 
                className="add-resource-btn"
                onClick={addResourceToTable}
                title="Добавить ресурс"
              >
                +
              </button>
            </div>
            
            <div className="resource-cell">
              <select
                className="resource-select"
                value={newResource.resourceId}
                onChange={handleResourceChange}
              >
                <option value="">Выберите ресурс</option>
                {resources.map(resource => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="resource-cell">
              <select
                className="measure-unit-select"
                value={newResource.measureUnitId}
                onChange={handleMeasureUnitChange}
              >
                <option value="">Выберите единицу измерения</option>
                {measureUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="resource-cell">
              <input
                type="number"
                className="quantity-input"
                value={newResource.quantity}
                onChange={handleQuantityChange}
                placeholder="Количество"
                min="0.01"
                step="0.01"
              />
            </div>
            
            <div className="resource-cell">
            </div>
          </div>
        </div>

        <div className="resources-table-container">
          {receiptResources.length > 0 ? (
            <table className="resources-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}></th>
                  <th>Ресурс</th>
                  <th>Единица измерения</th>
                  <th>Количество</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {receiptResources
                  .filter(resource => resource.status !== ResourceStatus.Deleted)
                  .map((resource) => (
                  <tr key={resource.id} className="resource-row">
                    <td className="resource-cell"></td>
                    <td className="resource-cell">{resource.name}</td>
                    <td className="resource-cell">{resource.measureUnitName}</td>
                    <td className="resource-cell">{resource.quantity}</td>
                    <td className="resource-cell">
                      <button
                        className="remove-resource-btn"
                        onClick={() => removeResourceFromTable(resource.id)}
                        title="Удалить ресурс"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-resources">
              Нет добавленных ресурсов. Используйте кнопку "+" для добавления.
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button 
          className="btn btn-add-save" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button 
          className="btn btn-cancel" 
          onClick={handleCancel}
          disabled={loading}
        >
          Назад к документам
        </button>
        <button 
          className="btn btn-delete" 
          onClick={handleDelete}
          disabled={loading}
        >
          Удалить документ
        </button>
      </div>
    </div>
  );
}

export default ReceiptDetails;