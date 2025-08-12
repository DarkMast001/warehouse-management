import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddShipment.css';

const AddShipment = () => {
  const navigate = useNavigate();
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [documentNumber, setDocumentNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [shipmentResources, setShipmentResources] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        const [clientsResponse, balanceResponse, resourcesResponse, measureUnitsResponse] = await Promise.all([
          axios.get('https://localhost:7111/clients/active'),
          axios.get('https://localhost:7111/balance'),
          axios.get('https://localhost:7111/resources'),
          axios.get('https://localhost:7111/measureunits')
        ]);
        
        const clientsData = clientsResponse.data;
        const balanceData = balanceResponse.data;
        const resourcesData = resourcesResponse.data;
        const measureUnitsData = measureUnitsResponse.data;
        
        setClients(clientsData);
        
        const resourceMap = {};
        resourcesData.forEach(resource => {
          resourceMap[resource.id] = resource.name;
        });

        const measureUnitMap = {};
        measureUnitsData.forEach(unit => {
          measureUnitMap[unit.id] = unit.name;
        });

        const formattedBalanceResources = balanceData.map(balance => ({
          ...balance,
          resourceName: resourceMap[balance.resourceId] || 'Не указан',
          measureUnitName: measureUnitMap[balance.measureUnitId] || 'Не указана',
          shipmentQuantity: 0
        }));
        
        setShipmentResources(formattedBalanceResources);
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleDocumentNumberChange = (event) => {
    setDocumentNumber(event.target.value);
  };

  const handleClientChange = (event) => {
    setSelectedClientId(event.target.value);
  };

  const handleDateChange = (event) => {
    setDocumentDate(event.target.value);
  };

  const handleShipmentQuantityChange = (balanceId, value) => {
    const quantity = parseFloat(value) || 0;
    
    setShipmentResources(prev => 
      prev.map(resource => 
        resource.id === balanceId 
          ? { ...resource, shipmentQuantity: quantity }
          : resource
      )
    );
  };

  const createDocument = async (signDocument = false) => {
    try {
      if (!documentNumber) {
        alert('Пожалуйста, введите номер документа');
        return;
      }

      if (!selectedClientId) {
        alert('Пожалуйста, выберите клиента');
        return;
      }

      if (!documentDate) {
        alert('Пожалуйста, введите дату документа');
        return;
      }

      const number = parseInt(documentNumber);
      if (isNaN(number) || number <= 0) {
        alert('Номер документа должен быть положительным числом');
        return;
      }

      const resourcesToShip = shipmentResources.filter(resource => resource.shipmentQuantity > 0);
      if (resourcesToShip.length === 0) {
        alert('Пожалуйста, укажите количество для отгрузки хотя бы одного ресурса');
        return;
      }

      const invalidResources = resourcesToShip.filter(resource => 
        resource.shipmentQuantity > resource.quantity
      );
      
      if (invalidResources.length > 0) {
        const invalidResourceNames = invalidResources.map(r => r.resourceName).join(', ');
        alert(`Количество для отгрузки превышает доступное количество для ресурсов: ${invalidResourceNames}`);
        return;
      }

      setLoading(true);

      const resourcePromises = resourcesToShip.map(async (resource) => {
        const resourceData = {
          resourceId: resource.resourceId,
          measureUnitId: resource.measureUnitId,
          quantity: resource.shipmentQuantity
        };
        
        const response = await axios.post('https://localhost:7111/shipments/resource', resourceData);
        return response.data;
      });

      const resourceIds = await Promise.all(resourcePromises);

      const documentData = {
        number: number,
        clientId: selectedClientId,
        date: documentDate,
        shipmentResourceIds: resourceIds
      };

      const documentResponse = await axios.post('https://localhost:7111/shipments/document', documentData);
      
      if (signDocument) {
        await axios.post(`https://localhost:7111/shipments/document/${documentResponse.data}/sign`);
      }

      navigate('/shipments');
    } catch (error) {
      if (error.status == 409) {
        alert('Документ с таким номером уже существует!');
      }
      else {
        console.error('Ошибка при создании документа:', error);
        alert('Ошибка при создании документа: ' + (error.response?.data?.message || error.message));
      }
      setLoading(false);
    }
  };

  const handleSave = () => {
    createDocument(false);
  };

  const handleSaveAndSign = () => {
    createDocument(true);
  };

  const handleCancel = () => {
    navigate('/shipments');
  };

  if (loading) {
    return <div className="add-shipment-loading">Загрузка данных...</div>;
  }

  return (
    <div className="add-shipment">
      <div className="add-shipment-header">
        <h1>Создать документ отгрузки</h1>
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
            <label className="form-label">Клиент *</label>
            <select
              className="form-select"
              value={selectedClientId}
              onChange={handleClientChange}
            >
              <option value="">Выберите клиента</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Дата документа *</label>
            <input
              type="date"
              className="form-input"
              value={documentDate}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      <div className="resources-section">
        <h2>Ресурсы для отгрузки</h2>
        
        <div className="resources-table-container">
          {shipmentResources.length > 0 ? (
            <table className="resources-table">
              <thead>
                <tr>
                  <th>Ресурс</th>
                  <th>Единица измерения</th>
				          <th>Количество для отгрузки</th>
                  <th>Доступное количество</th>
                </tr>
              </thead>
              <tbody>
                {shipmentResources.map((resource) => (
                  <tr key={resource.id} className="resource-row">
                    <td className="resource-cell">{resource.resourceName}</td>
                    <td className="resource-cell">{resource.measureUnitName}</td>
                    <td className="resource-cell">
                      <input
                        type="number"
                        className="quantity-input"
                        value={resource.shipmentQuantity}
                        onChange={(e) => handleShipmentQuantityChange(resource.id, e.target.value)}
                        min="0"
                        max={resource.quantity}
                        step="0.01"
                      />
                    </td>
                    <td className="resource-cell">{resource.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-resources">
              Нет доступных ресурсов для отгрузки
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button 
          className="btn btn-add-save" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button 
          className="btn btn-apply-to-work" 
          onClick={handleSaveAndSign}
          disabled={loading}
        >
          {loading ? 'Сохранение...' : 'Сохранить и подписать'}
        </button>
        <button 
          className="btn btn-cancel" 
          onClick={handleCancel}
          disabled={loading}
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default AddShipment;