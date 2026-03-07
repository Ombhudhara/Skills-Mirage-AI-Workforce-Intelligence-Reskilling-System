import React, { useEffect, useRef } from 'react';

const BackgroundEffect = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        const stars = [];
        const starCount = 120;

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 2,
                speed: Math.random() * 0.3 + 0.1,
                opacity: Math.random(),
            });
        }

        const draw = () => {
            const isDark = document.documentElement.classList.contains('dark');
            ctx.clearRect(0, 0, w, h);

            // Draw background gradient based on theme
            if (isDark) {
                const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.8);
                gradient.addColorStop(0, '#0b0d17');
                gradient.addColorStop(1, '#000000');
                ctx.fillStyle = gradient;
            } else {
                const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.8);
                gradient.addColorStop(0, '#f8fafc');
                gradient.addColorStop(1, '#e2e8f0');
                ctx.fillStyle = gradient;
            }
            ctx.fillRect(0, 0, w, h);

            // Draw subtle nebula glow
            ctx.beginPath();
            const nebulaGlow = ctx.createRadialGradient(
                w * (isDark ? 0.7 : 0.3),
                h * (isDark ? 0.3 : 0.7),
                0,
                w * (isDark ? 0.7 : 0.3),
                h * (isDark ? 0.3 : 0.7),
                w * 0.5
            );

            if (isDark) {
                nebulaGlow.addColorStop(0, 'rgba(123, 44, 191, 0.08)');
                nebulaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            } else {
                nebulaGlow.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
                nebulaGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            }

            ctx.fillStyle = nebulaGlow;
            ctx.fillRect(0, 0, w, h);

            // Draw drifting particles
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

                if (isDark) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                } else {
                    ctx.fillStyle = `rgba(123, 44, 191, ${star.opacity * 0.4})`;
                }
                ctx.fill();

                star.y -= star.speed;
                if (star.y < 0) {
                    star.y = h;
                    star.x = Math.random() * w;
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none transition-opacity duration-1000"
        />
    );
};

export default BackgroundEffect;
