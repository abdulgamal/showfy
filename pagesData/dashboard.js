import React from 'react';
import DashboardView from "../containers/Dashboard/Index"

const Dashboard = (props) => {
  return (
    <React.Fragment>
    {
      <DashboardView {...props}  />
    }
    </React.Fragment>
  )
}

export default Dashboard