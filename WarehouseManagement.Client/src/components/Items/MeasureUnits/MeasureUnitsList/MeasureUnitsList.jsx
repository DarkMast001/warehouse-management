import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// import './MeasureUnitsList.css';

const MeasureUnitsList = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get('https://localhost:7111/measureunits/active');
        const formattedResources = response.data.map(resource => ({
          id: resource.id,
          name: resource.name,
          archivingState: resource.archivingState
        }));
        setResources(formattedResources);
      } catch (error) {
        console.error('Ошибка при получении единиц измерения:', error);
      }
    };

    fetchResources();
  }, []);

	return(
		<div className="items-list">
      <div className="items-header">
        <h1>Единицы измерения</h1>
        <div className="items-actions">
          <Link to="/measureunits/new" className="btn btn-add-save">Добавить</Link>
          <Link to="/measureunits/archived" className="btn btn-archive">К архиву</Link>
        </div>
      </div>
      
      <div className="items-table-container">
        {resources.length === 0 ? (
          <div className="no-items">
            Нет единиц измерения
          </div>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>Наименование</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id} className="item-row">
                  <td>
                    <Link to={`/measureunits/${resource.id}`} className="item-link">
                      {resource.name}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
	);
}

export default MeasureUnitsList;