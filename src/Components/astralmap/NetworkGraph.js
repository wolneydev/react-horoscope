import React from 'react';
import Svg, { Line, Text as SvgText, Polygon, Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';

// Paleta para fundo claro: azulados, lilás, dourado
const casaColors = [
    "#4d5fb7", "#a88cff", "#76a6d8", "#ffb04a", "#6fc1b6", "#d2c069",
    "#8c6df4", "#56cbb0", "#7e73ee", "#ffac86", "#5a90c7", "#b1adb9"
];

const signos = [
    "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
    "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
];

const Arrow = ({ x1, y1, x2, y2, color }) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 8;
    const xEnd = x2 - Math.cos(angle) * 6;
    const yEnd = y2 - Math.sin(angle) * 6;
    const xArrow1 = xEnd - arrowLength * Math.cos(angle - Math.PI / 7);
    const yArrow1 = yEnd - arrowLength * Math.sin(angle - Math.PI / 7);
    const xArrow2 = xEnd - arrowLength * Math.cos(angle + Math.PI / 7);
    const yArrow2 = yEnd - arrowLength * Math.sin(angle + Math.PI / 7);

    return (
        <>
            <Line
                x1={x1}
                y1={y1}
                x2={xEnd}
                y2={yEnd}
                stroke={color}
                strokeWidth="2"
                opacity={0.8}
            />
            <Polygon
                points={`${xEnd},${yEnd} ${xArrow1},${yArrow1} ${xArrow2},${yArrow2}`}
                fill={color}
                opacity={0.88}
            />
        </>
    );
};

const NetworkGraph = ({ data, size = 220 }) => {
    const center = size / 2;
    const radius = size * 0.39;
    const planetRadius = size * 0.25; // onde ficam os planetas

    // ângulo 0° no topo, sentido horário
    function getAngleFromDegree(degree) {
        return ((degree - 90) * Math.PI) / 180;
    }

    // Linhas das casas
    const casas = Array.from({ length: 12 }).map((_, i) => {
        const angle = getAngleFromDegree(i * 30);
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return (
            <Line
                key={`casa-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#e2e3ea"
                strokeWidth="1"
                opacity={0.87}
            />
        );
    });

    // Círculo do zodíaco
    const zodiacCircle = (
        <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#ceb468"
            strokeWidth="3"
            fill="url(#bgGradient)"
        />
    );

    // Nomes dos signos nas 12 casas, externos
    const signosLabels = signos.map((name, i) => {
        const angle = getAngleFromDegree(i * 30 + 15);
        const labelRadius = radius + 20;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        return (
            <SvgText
                key={name}
                x={x}
                y={y + 4}
                fontSize={13}
                fill="#978f77"
                fontWeight="700"
                textAnchor="middle"
                alignmentBaseline="middle"
            >
                {name}
            </SvgText>
        );
    });

    // Astros: círculo, seta, texto. Rótulo fora do círculo, grau dentro.
    const astros = (data || []).map((item, i) => {
        const signIndex = item.signIndex !== undefined
            ? item.signIndex
            : (i % 12);
        const totalDegree = (signIndex * 30) + (item.degree || 0);
        const angle = getAngleFromDegree(totalDegree);

        // planeta posicionado dentro do círculo
        const x = center + planetRadius * Math.cos(angle);
        const y = center + planetRadius * Math.sin(angle);
        // seta: centro até planeta
        const color = casaColors[signIndex % 12];

        // label fora do círculo para não sobrepor
        const labelRadius = planetRadius + 32;
        const labelX = center + labelRadius * Math.cos(angle);
        const labelY = center + labelRadius * Math.sin(angle);

        return (
            <G key={item.name + i}>
                <Arrow
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    color={color}
                />
                <Circle
                    cx={x}
                    cy={y}
                    r={8}
                    fill={color}
                    opacity={0.95}
                    stroke="#fff"
                    strokeWidth={2}
                />
                {/* Grau dentro do círculo do planeta */}
                <SvgText
                    x={x}
                    y={y + 4}
                    fontSize={11}
                    fontWeight="bold"
                    fill="#fff"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                >
                    {item.degree}°
                </SvgText>
                {/* Nome do planeta, fora do círculo */}
                <SvgText
                    x={labelX}
                    y={labelY + 4}
                    fontSize={13}
                    fill="#222"
                    fontWeight="500"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                >
                    {item.name}
                </SvgText>
            </G>
        );
    });

    // Centro
    const centro = (
        <Circle cx={center} cy={center} r={11} fill="#ceb468" opacity={0.96} />
    );

    // Fundo branco
    const backgroundCircle = (
        <Circle
            cx={center}
            cy={center}
            r={center}
            fill="#fff"
        />
    );

    return (
        <Svg width={size} height={size} style={{ width: size, height: size }}>
            <Defs>
                <RadialGradient
                    id="bgGradient"
                    cx="50%" cy="50%" r="90%"
                    fx="50%" fy="50%"
                >
                    <Stop offset="0%" stopColor="#f7f6fa" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#fff" stopOpacity="1" />
                </RadialGradient>
            </Defs>
            {backgroundCircle}
            {zodiacCircle}
            {casas}
            {signosLabels}
            {astros}
            {centro}
        </Svg>
    );
};

export default NetworkGraph;
