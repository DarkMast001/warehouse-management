import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ArchivedClients.css';

const ArchivedClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchivedClients = async () => {
      try {
        const response = await axios.get('https://localhost:7111/clients/archived'); 
		const formattedClients = response.data.map(user => ({
          id: user.id,
          name: user.name,
          address: user.address || 'Не указан',
          archivingState: user.archivingState
        }));
        setClients(formattedClients);
		setLoading(false);
        
      } catch (error) {
        console.error('Ошибка при получении архивных клиентов:', error);
        setLoading(false);
      }
    };

    fetchArchivedClients();
  }, []);

  if (loading) {
    return <div className="archived-items-loading">Загрузка архивных клиентов...</div>;
  }

  return (
    <div className="archived-items">
      <div className="archived-items-header">
        <h1>Архивные клиенты</h1>
        <div className="archived-items-actions">
          <Link to="/clients" className="btn btn-apply-to-work">Назад к клиентам</Link>
        </div>
      </div>
      
      <div className="archived-items-table-container">
        {clients.length === 0 ? (
          <div className="no-archived-items">
            Нет архивных клиентов
          </div>
        ) : (
          <table className="archived-items-table">
            <thead>
              <tr>
                <th>Наименование</th>
                <th>Адрес</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="archived-item-row">
                  <td>
                    <Link to={`/clients/${client.id}`} className="archived-item-link">
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

export default ArchivedClients;