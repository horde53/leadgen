import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EconomyChartProps {
  billValue: number;
  monthlyEconomy: number;
}

export const EconomyChart: React.FC<EconomyChartProps> = ({ billValue, monthlyEconomy }) => {
  const currentBill = billValue;
  const newBill = billValue - monthlyEconomy;

  const data = {
    labels: ['Conta Atual', 'Conta com Alexandria'],
    datasets: [
      {
        label: 'Valor da Conta (R$)',
        data: [currentBill, newBill],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)', // Vermelho para conta atual
          'rgba(34, 197, 94, 0.8)', // Verde para economia
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
            family: 'Inter',
          },
        },
      },
      title: {
        display: true,
        text: 'Comparação da sua Conta de Luz',
        font: {
          size: 16,
          family: 'Inter',
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return 'R$ ' + value.toFixed(2);
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-64 p-4">
      <Bar data={data} options={options} />
    </div>
  );
};