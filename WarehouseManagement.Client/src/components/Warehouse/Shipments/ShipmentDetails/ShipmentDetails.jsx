import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../apiClient';
import Notification from '../../../Notification/Notification';
import './ShipmentDetails.css';

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [document, setDocument] = useState(null);
  const [clients, setClients] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

	const [documentNumber, setDocumentNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [shipmentResources, setShipmentResources] = useState([]);

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
    const fetchDocument = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get(`/shipments/documents/${id}`);
        const document = response.data[0]
        setDocument(document);

        if (document.status !== "SIGNED") {
          setIsEditing(true);

          const [clientsResponse, balanceResponse, resourcesResponse, measureUnitsResponse] = await Promise.all([
            apiClient.get('/clients/active'),
            apiClient.get('/balance'),
            apiClient.get('/resources'),
            apiClient.get('/measureunits')
          ]);

          const documentNumberData = document.number;
          const clientsData = clientsResponse.data;
          const balanceData = balanceResponse.data;
          const resourcesData = resourcesResponse.data;
          const measureUnitsData = measureUnitsResponse.data;
          const resourcesInDocumentData = document.resources;

          setDocumentNumber(documentNumberData);
          setClients(clientsData);

          setSelectedClientId(document.clientId);
          setDocumentDate(document.date);

          const resourceInBalanceMap = {};
          resourcesData.forEach(resource => {
            resourceInBalanceMap[resource.id] = resource.name;
          });

          const resourceInDocumentMap = {};
          resourcesInDocumentData.forEach(resource => {
            resourceInDocumentMap[resource.resourceId] = resource.quantity;
          });

          const measureUnitMap = {};
          measureUnitsData.forEach(unit => {
            measureUnitMap[unit.id] = unit.name;
          });

          const formattedBalanceResources = balanceData.map(balance => ({
            ...balance,
            resourceName: resourceInBalanceMap[balance.resourceId] || 'Не указан',
            measureUnitName: measureUnitMap[balance.measureUnitId] || 'Не указана',
            shipmentQuantity: (resourceInDocumentMap[balance.resourceId] !== undefined) ? resourceInDocumentMap[balance.resourceId] : 0
          }));

          setShipmentResources(formattedBalanceResources)
        }
      } 
      catch (error) {
        showNotification('Ошибка получения документа.')
        console.error("Ошибка при получении документа:", error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

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

  const updateDocument = async (signDocument = false) => {
    try {
      if (!documentNumber) {
        showNotification('Пожалуйста, введите номер документа');
        return;
      }

      if (!selectedClientId) {
        showNotification('Пожалуйста, выберите клиента');
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

      const resourcesToShip = shipmentResources.filter(resource => resource.shipmentQuantity > 0);
      if (resourcesToShip.length === 0) {
        showNotification('Пожалуйста, укажите количество для отгрузки хотя бы одного ресурса');
        return;
      }

      const invalidResources = resourcesToShip.filter(resource => 
        resource.shipmentQuantity > resource.quantity
      );
      
      if (invalidResources.length > 0) {
        const invalidResourceNames = invalidResources.map(r => r.resourceName).join(', ');
        showNotification(`Количество для отгрузки превышает доступное количество для ресурсов: ${invalidResourceNames}`);
        return;
      }

      setLoading(true);

      await apiClient.delete(`/shipments/documents/${document.id}`);

      const resourcePromises = resourcesToShip.map(async (resource) => {
        const resourceData = {
          resourceId: resource.resourceId,
          measureUnitId: resource.measureUnitId,
          quantity: resource.shipmentQuantity
        };
        
        const response = await apiClient.post('/shipments/resources', resourceData);
        return response.data;
      });

      const resourceIds = await Promise.all(resourcePromises);

      const documentData = {
        number: number,
        clientId: selectedClientId,
        date: documentDate,
        shipmentResourceIds: resourceIds
      };

      const documentResponse = await apiClient.post('/shipments/documents', documentData);
      
      if (signDocument) {
        await apiClient.post(`/shipments/documents/${documentResponse.data}/sign`);
      }

      navigate('/shipments');
    } 
    catch (error) {
      if (error.status == 409) {
        showNotification('Документ с таким номером уже существует!');
      }
      else {
        console.error('Ошибка при создании документа:', error);
        showNotification('Ошибка при создании документа: ' + (error.response?.data?.message || error.message));
      }
    }
    finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    updateDocument(false);
  };

  const handleSaveAndSign = () => {
    updateDocument(true);
  };

  const handleCancel = () => {
    navigate('/shipments');
  };

  const handleDelete = async () => {
    setLoading(true);

    await apiClient.delete(`/shipments/documents/${document.id}`);

    setLoading(false);

    navigate('/shipments');
  }

  const handleSignDocument = async () => {
    try {
      setActionLoading(true);
      await apiClient.post(`/shipments/documents/${id}/sign`);
      
      setDocument(prev => ({
        ...prev,
        status: 'SIGNED'
      }));
      
	  navigate("/shipments");
    } 
    catch (error) {
      console.error('Ошибка при подписании документа:', error);
      showNotification('Ошибка при подписании документа: ' + (error.response?.data?.message || error.message));
    } 
    finally {
      setActionLoading(false);
    }
  };

  const handleUnsignDocument = async () => {
    try {
      setActionLoading(true);
      await apiClient.post(`/shipments/documents/${id}/unsign`);
      
      setDocument(prev => ({
        ...prev,
        status: 'NOT_SIGNED'
      }));

	  navigate("/shipments")
    } 
    catch (error) {
      console.error('Ошибка при отзыве документа:', error);
      showNotification('Ошибка при отзыве документа: ' + (error.response?.data?.message || error.message));
    } 
    finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/shipments');
  };

  if (loading) {
    return <div className="shipment-details-loading">Загрузка документа...</div>;
  }

  if (!document) {
    return (
      <div className="shipment-details-error">
        Документ не найден
        <div className="form-actions">
          <button className="btn btn-cancel" onClick={handleBack}>
            Назад к документам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shipment-details">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="shipment-details-header">
        <h1>Документ отгрузки №{document.number}</h1>
      </div>

      {isEditing ? (
        <div className="add-shipment">
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
            <button 
              className="btn btn-delete" 
              onClick={handleDelete}
              disabled={loading}
            >
              Удалить
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="form-actions">
            {document.status?.toLowerCase() !== 'signed' ? (
              <button 
                className="btn btn-add-save" 
                onClick={handleSignDocument}
                disabled={actionLoading}
              >
                {actionLoading ? 'Подписание...' : 'Подписать'}
              </button>
            ) : (
              <button 
                className="btn btn-delete" 
                onClick={handleUnsignDocument}
                disabled={actionLoading}
              >
                {actionLoading ? 'Отзыв...' : 'Отозвать'}
              </button>
            )}
            
            <button 
              className="btn btn-apply-to-work" 
              onClick={handleBack}
              disabled={actionLoading}
            >
              Назад к документам
            </button>
          </div>

          <div className="resources-section">
            <h2>Ресурсы в документе</h2>
            
            <div className="resources-table-container">
              {document.resources && document.resources.length > 0 ? (
                <table className="resources-table">
                  <thead>
                    <tr>
                      <th>Ресурс</th>
                      <th>Единица измерения</th>
                      <th>Количество</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.resources.map((resource) => (
                      <tr key={resource.id} className="resource-row">
                        <td className="resource-cell">{resource.name}</td>
                        <td className="resource-cell">{resource.measureUnitName}</td>
                        <td className="resource-cell">{resource.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-resources">
                  В документе нет ресурсов
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ShipmentDetails;