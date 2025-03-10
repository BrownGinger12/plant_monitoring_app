import { StatusBar } from 'react-native';
import './global.css';
import PlantDashboard from 'components/PlantDashboard';

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <PlantDashboard />
    </>
  );
}
