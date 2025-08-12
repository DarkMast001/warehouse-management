import { Link } from 'react-router-dom';

import './Sidebar.css'

const Sidebar = () => {
	return (
	<div className="sidebar">
		<div className="sidebar-header">
			<h2>Склад</h2>
		</div>
		<ul className="sidebar-menu">
			<li className="sidebar-item">
			  <Link to="/balance" className="sidebar-link">Баланс</Link>
			</li>
			<li className="sidebar-item">
			  <Link to="/receipts" className="sidebar-link">Поступления</Link>
			</li>
			<li className="sidebar-item">
			  <Link to="/shipments" className="sidebar-link">Отгрузки</Link>
			</li>
		</ul>
		
		<div className="sidebar-header">
			<h2>Справочники</h2>
		</div>
		<ul className="sidebar-menu">
			<li className="sidebar-item">
			  <Link to="/clients" className="sidebar-link">Клиенты</Link>
			</li>
			<li className="sidebar-item">
			  <Link to="/measureunits" className="sidebar-link">Единицы измерения</Link>
			</li>
			<li className="sidebar-item">
			  <Link to="/resources" className="sidebar-link">Ресурсы</Link>
			</li>
		</ul>
	</div>
  );
}

export default Sidebar;