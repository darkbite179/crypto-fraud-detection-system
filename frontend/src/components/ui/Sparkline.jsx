import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({ data, color = 'var(--cyan)', height = 30 }) {
    const chartData = data.map((value, index) => ({ index, value }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
