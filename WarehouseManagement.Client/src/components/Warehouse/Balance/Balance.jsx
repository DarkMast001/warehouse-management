import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Balance.css'

const Balance = () => {
  const [balances, setBalances] = useState([]);
  const [resources, setResources] = useState([]);
  const [measureUnits, setMeasureUnits] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [selectedMeasureUnitId, setSelectedMeasureUnitId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const balanceResponse = await axios.get('https://localhost:7111/balance');
        const balancesData = balanceResponse.data;

        const resourcesResponse = await axios.get('https://localhost:7111/resources');
        const resourcesData = resourcesResponse.data;

        const measureUnitsResponse = await axios.get('https://localhost:7111/measureunits');
        const measureUnitsData = measureUnitsResponse.data;

        setResources(resourcesData);
        setMeasureUnits(measureUnitsData);

        const formattedBalances = await formatBalancesWithNames(balancesData, resourcesData, measureUnitsData);
        setBalances(formattedBalances);

        setLoading(false);
      } catch (error) {
        console.error('Ошибка при получении клиентов:', error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const formatBalancesWithNames = async (balancesData, resourcesData, measureUnitsData) => {
    const resourceMap = {};
    resourcesData.forEach(resource => {
      resourceMap[resource.id] = resource.name;
    });

    const measureUnitMap = {};
    measureUnitsData.forEach(unit => {
      measureUnitMap[unit.id] = unit.name;
    });

    return balancesData.map(balance => ({
      id: balance.id,
      resourceId: balance.resourceId,
      resourceName: resourceMap[balance.resourceId] || 'Не указан',
      measureUnitId: balance.measureUnitId,
      measureUnitName: measureUnitMap[balance.measureUnitId] || 'Не указана',
      quantity: balance.quantity
    }));
  };

  const handleResourceChange = (e) => {
    setSelectedResourceId(e.target.value);
  };

  const handleMeasureUnitChange = (e) => {
    setSelectedMeasureUnitId(e.target.value);
  };

  const applyFilter = async () => {
    try {
      const filterData = {
        resourceId: selectedResourceId || "",
        measureUnitId: selectedMeasureUnitId || ""
      };
      const response = await axios.post('https://localhost:7111/balance/filter', filterData);

      const formattedBalances = await formatBalancesWithNames(response.data, resources, measureUnits);
      setBalances(formattedBalances);
    } catch (error) {
      console.error('Ошибка при применении фильтра:', error);
    }
  };

  const resetFilter = async () => {
    try {
      setSelectedResourceId('');
      setSelectedMeasureUnitId('');
      
      const response = await axios.get('https://localhost:7111/balance');

      const formattedBalances = await formatBalancesWithNames(response.data, resources, measureUnits);
      setBalances(formattedBalances);
    } catch (error) {
      console.error('Ошибка при сбросе фильтра:', error);
    }
  };

  if (loading) {
    return <div className="balance-loading">Загрузка содержимого...</div>;
  }

  return (
    <div className="balances-list">
      <div className="balances-header">
        <h1>Баланс</h1>
      </div>
      
      <div className="balance-filters">
        <label>
          Ресурс
          <select 
            className="balance-filter-select" 
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

        <label>
          Единица измерения
          <select
            className="balance-filter-select"
            value={selectedMeasureUnitId}
            onChange={handleMeasureUnitChange}
            >
            <option value="">Все единицы измерения</option>
            {measureUnits.map(measureUnit => (
              <option key={measureUnit.id} value={measureUnit.id}>
                {measureUnit.name}
              </option>
            ))}
          </select>
        </label>
        
        <div className="balance-filter-actions">
          <button className="btn btn-apply-to-work" onClick={applyFilter}>Применить</button>
          <button className="btn btn-cancel" onClick={resetFilter}>Сбросить</button>
        </div>
      </div>

      <div className="balances-table-container">
        {balances.length === 0 ? (
          <div className="no-balances">
            Нет ресурсов на складе
          </div>
        ) : (
          <table className="balances-table">
            <thead>
              <tr>
                <th>Наименование</th>
                <th>Единица измерения</th>
                <th>Количество</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((balance) => (
                <tr key={balance.id} className="balance-row">
                  <td>{balance.resourceName}</td>
                  <td>{balance.measureUnitName}</td>
                  <td>{balance.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Balance;