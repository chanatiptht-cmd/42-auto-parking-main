import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { REPORT_COLORS } from '../../utils/reports';
import { money } from '../../utils/parking';

type Series = { label: string; revenue: number; entries: number; exits: number }[];

export function RevenueChart({ series }: { series: Series }) {
  return (
    <div className="report-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 12, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#ececf4" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            minTickGap={20}
          />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => [money(Number(value)), 'รายรับ']} />
          <Bar
            isAnimationActive={false}
            dataKey="revenue"
            name="รายรับ (บาท)"
            fill={REPORT_COLORS[0]}
            maxBarSize={52}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReportTrafficChart({ series }: { series: Series }) {
  return (
    <div className="report-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 12, right: 10, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#ececf4" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            minTickGap={20}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value, name) => [`${value} คัน`, name]} />
          <Legend verticalAlign="top" align="right" />
          <Bar
            dataKey="entries"
            name="รถเข้า"
            fill={REPORT_COLORS[0]}
            maxBarSize={26}
            isAnimationActive={false}
          />
          <Bar
            dataKey="exits"
            name="รถออก"
            fill={REPORT_COLORS[1]}
            maxBarSize={26}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityChart({ series }: { series: Series }) {
  return (
    <div className="report-chart report-chart--large">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 20, left: -12, right: 20, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={20} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value, name) => [`${value} คัน`, name]} />
          <Legend />
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="entries"
            name="รถเข้า"
            stroke="#2c66f5"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="exits"
            name="รถออก"
            stroke="#ec7182"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  values,
  total,
  unit,
}: {
  values: { name: string; value: number }[];
  total: number;
  unit: string;
}) {
  return (
    <>
      <div className="report-donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={values}
              dataKey="value"
              nameKey="name"
              innerRadius="66%"
              outerRadius="84%"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {values.map((value, index) => (
                <Cell key={value.name} fill={REPORT_COLORS[index % REPORT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} ${unit}`]} />
            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="donut-total"
            >
              {total.toLocaleString()}
            </text>
            <text x="50%" y="59%" textAnchor="middle" className="donut-unit">
              {unit}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="donut-legend">
        {values.map((value, index) => (
          <span key={value.name}>
            <i style={{ background: REPORT_COLORS[index % REPORT_COLORS.length] }} />
            {value.name} ({total ? Math.round((value.value / total) * 100) : 0}%)
          </span>
        ))}
      </div>
    </>
  );
}
