import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PlantData {
  datetime: Date;
  displayTime: string;
  displayDate: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
}

interface ChartInfo {
  title: string;
  unit: string;
}

interface StatusInfo {
  icon: string;
  color: string;
}

interface DayData {
  label: string;
  value: string;
  data: PlantData[];
}

type PlantStatus = 'healthy' | 'needs water' | 'too hot' | 'low humidity';
type MetricType = 'temperature' | 'humidity' | 'soilMoisture';

const generateHistoricalData = (): DayData[] => {
  const days: DayData[] = [];
  const now = new Date();
  
  // Generate last 7 days of data
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Generate hourly data for each day
    const dayData: PlantData[] = [];
    for (let hour = 0; hour < 24; hour += 2) { // Every 2 hours
      const datetime = new Date(date);
      datetime.setHours(hour, 0, 0, 0);
      
      dayData.push({
        datetime: datetime,
        displayTime: datetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        displayDate: datetime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        temperature: Math.floor(Math.random() * 10) + 65, // 65-75°F
        humidity: Math.floor(Math.random() * 20) + 50, // 50-70%
        soilMoisture: Math.floor(Math.random() * 30) + 40, // 40-70%
      });
    }
    
    days.push({
      label: dayStr,
      value: dayStr,
      data: dayData
    });
  }
  
  return days;
};

const PlantDashboard: React.FC = () => {
  const [allDaysData, setAllDaysData] = useState<DayData[]>(generateHistoricalData());
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [plantData, setPlantData] = useState<PlantData[]>(allDaysData[0].data);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('temperature');
  const [plantStatus, setPlantStatus] = useState<PlantStatus>('healthy');
  const [dayPickerVisible, setDayPickerVisible] = useState<boolean>(false);
  
  // Get current values (most recent data)
  const currentData = plantData[plantData.length - 1];
  
  // Update plant data when day selection changes
  useEffect(() => {
    setPlantData(allDaysData[selectedDayIndex].data);
  }, [selectedDayIndex, allDaysData]);
  
  // Determine plant status based on current metrics
  useEffect(() => {
    const { temperature, humidity, soilMoisture } = currentData;
    
    if (soilMoisture < 45) {
      setPlantStatus('needs water');
    } else if (temperature > 75) {
      setPlantStatus('too hot');
    } else if (humidity < 55) {
      setPlantStatus('low humidity');
    } else {
      setPlantStatus('healthy');
    }
  }, [currentData]);
  
  // Function to refresh data
  const refreshData = (): void => {
    const newData = generateHistoricalData();
    setAllDaysData(newData);
    setPlantData(newData[selectedDayIndex].data);
  };
  
  // Format the data for the selected metric chart
  const chartData = {
    labels: plantData.map(item => item.displayTime),
    datasets: [
      {
        data: plantData.map(item => item[selectedMetric]),
        color: (opacity = 1) => {
          switch (selectedMetric) {
            case 'temperature': return `rgba(239, 68, 68, ${opacity})`; // red-500
            case 'humidity': return `rgba(59, 130, 246, ${opacity})`; // blue-500
            case 'soilMoisture': return `rgba(120, 53, 15, ${opacity})`; // amber-900
            default: return `rgba(34, 197, 94, ${opacity})`; // green-500
          }
        },
        strokeWidth: 2,
      },
    ],
  };
  
  // Get appropriate chart title and units
  const getChartInfo = (): ChartInfo => {
    switch (selectedMetric) {
      case 'temperature':
        return { title: 'Temperature', unit: '°F' };
      case 'humidity':
        return { title: 'Humidity', unit: '%' };
      case 'soilMoisture':
        return { title: 'Soil Moisture', unit: '%' };
      default:
        return { title: '', unit: '' };
    }
  };
  
  const chartInfo = getChartInfo();
  
  // Get status icon and color
  const getStatusInfo = (): StatusInfo => {
    switch (plantStatus) {
      case 'healthy':
        return { icon: 'check-circle', color: '#22c55e' }; // green-500
      case 'needs water':
        return { icon: 'water-alert', color: '#f97316' }; // orange-500
      case 'too hot':
        return { icon: 'thermometer-high', color: '#ef4444' }; // red-500
      case 'low humidity':
        return { icon: 'water-percent-alert', color: '#eab308' }; // yellow-500
      default:
        return { icon: 'help-circle', color: '#6b7280' }; // gray-500
    }
  };
  
  const statusInfo = getStatusInfo();

  // Screen width for the chart
  const screenWidth = Dimensions.get('window').width - 32; // -32 for the margin
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 bg-green-300 border-b border-gray-200">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Greenhouse Monitor</Text>
          </View>
          <TouchableOpacity 
            className="h-10 w-10 rounded-full bg-green-50 items-center justify-center"
            onPress={refreshData}
          >
            <MaterialCommunityIcons name="refresh" size={24} color="#22c55e" />
          </TouchableOpacity>
        </View>

        {/* Plant Status Card */}
        <View className="m-4 bg-white rounded-xl p-4 shadow">
          
            
          {/* Current Metrics */}
          <View className="flex-row justify-between mt-4">
            <View className="items-center p-2">
              <MaterialCommunityIcons name="thermometer" size={30} color="#ef4444" />
              <Text className="text-xl font-bold mt-1">{currentData.temperature}°F</Text>
              <Text className="text-sm text-gray-500">Temperature</Text>
            </View>
            
            <View className="items-center p-2">
              <MaterialCommunityIcons name="water-percent" size={30} color="#3b82f6" />
              <Text className="text-xl font-bold mt-1">{currentData.humidity}%</Text>
              <Text className="text-sm text-gray-500">Humidity</Text>
            </View>
            
            <View className="items-center p-2">
              <MaterialCommunityIcons name="water" size={30} color="#92400e" />
              <Text className="text-xl font-bold mt-1">{currentData.soilMoisture}%</Text>
              <Text className="text-sm text-gray-500">Soil Moisture</Text>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View className="m-4 bg-white rounded-xl p-4 shadow">
          {/* Day Selector */}
          <TouchableOpacity 
            className="flex-row items-center justify-between p-2 mb-2 border border-gray-200 rounded-lg"
            onPress={() => setDayPickerVisible(true)}
          >
            <Text className="text-lg font-semibold">{allDaysData[selectedDayIndex].label}</Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#6b7280" />
          </TouchableOpacity>
          
          <Text className="text-lg font-semibold mb-2">{chartInfo.title} Throughout the Day</Text>
          
          {/* Chart Buttons */}
          <View className="flex-row mb-4">
            <TouchableOpacity
              className={`mr-2 py-1 px-3 rounded-full ${selectedMetric === 'temperature' ? 'bg-red-500' : 'bg-gray-200'}`}
              onPress={() => setSelectedMetric('temperature')}
            >
              <Text className={`${selectedMetric === 'temperature' ? 'text-white' : 'text-gray-800'}`}>
                Temperature
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`mr-2 py-1 px-3 rounded-full ${selectedMetric === 'humidity' ? 'bg-blue-500' : 'bg-gray-200'}`}
              onPress={() => setSelectedMetric('humidity')}
            >
              <Text className={`${selectedMetric === 'humidity' ? 'text-white' : 'text-gray-800'}`}>
                Humidity
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`py-1 px-3 rounded-full ${selectedMetric === 'soilMoisture' ? 'bg-amber-800' : 'bg-gray-200'}`}
              onPress={() => setSelectedMetric('soilMoisture')}
            >
              <Text className={`${selectedMetric === 'soilMoisture' ? 'text-white' : 'text-gray-800'}`}>
                Soil Moisture
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Line Chart */}
          <LineChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
              },
              propsForLabels: {
                fontSize: 10,
                rotation: -45,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            yAxisSuffix={selectedMetric === 'temperature' ? '°F' : '%'}
          />
          
          {/* Legend */}
          <View className="flex-row items-center justify-center mt-2">
            <View className="h-4 w-4 rounded mr-1" style={{ backgroundColor: selectedMetric === 'temperature' ? '#ef4444' : 
                                                            selectedMetric === 'humidity' ? '#3b82f6' : '#92400e' }} />
            <Text className="text-sm text-gray-600">
              {chartInfo.title} ({chartInfo.unit})
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Day Picker Modal */}
      <Modal
        visible={dayPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDayPickerVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Select Day</Text>
              <TouchableOpacity onPress={() => setDayPickerVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="max-h-80">
              {allDaysData.map((day, index) => (
                <TouchableOpacity 
                  key={index}
                  className={`p-4 border-b border-gray-100 ${index === selectedDayIndex ? 'bg-green-50' : ''}`}
                  onPress={() => {
                    setSelectedDayIndex(index);
                    setDayPickerVisible(false);
                  }}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg">{day.label}</Text>
                    {index === selectedDayIndex && (
                      <MaterialCommunityIcons name="check" size={24} color="#22c55e" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PlantDashboard;