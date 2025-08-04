import React from 'react';
import Hero from './hero/hero.jsx';
import Info from './info/info.jsx';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <Hero />
            <Info />
        </div>
    );
};

export default Dashboard;