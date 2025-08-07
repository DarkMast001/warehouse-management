import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ClientsList.css';

const ClientsList = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('https://localhost:7111/clients/active');
        const formattedClients = response.data.map(user => ({
          id: user.id,
          name: user.name,
          address: user.address || 'Не указан',
          archivingState: user.archivingState
        }));
        setClients(formattedClients);
      } catch (error) {
        console.error('Ошибка при получении клиентов:', error);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="items-list">
      <div className="items-header">
        <h1>Клиенты</h1>
        <div className="items-actions">
          <Link to="/clients/new" className="btn btn-add-save">Добавить</Link>
          <Link to="/clients/archived" className="btn btn-archive">К архиву</Link>
        </div>
      </div>
      
      <div className="items-table-container">
        {clients.length === 0 ? (
          <div className="no-items">
            Нет клиентов
          </div>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>Наименование</th>
                <th>Адрес</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="item-row">
                  <td>
                    <Link to={`/clients/${client.id}`} className="item-link">
                      {client.name}
                    </Link>
                  </td>
                  <td>{client.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClientsList;