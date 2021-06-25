import React, { useEffect, useRef, useState } from 'react';

const Canvas = (canvasRef, canvasStyle) => {
    const [startPosition, setStartPosition] = useState();
    const [lastPosition, setLastPosition] = useState();
    const [isPainting, setIsPainting] = useState(false);


    const startPaint = (event) => {
        const coordinates = getCoordinates(event);
        if (coordinates) {
            setStartPosition(coordinates);
            setIsPainting(true);
        }
    };

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        canvas.addEventListener('mousedown', startPaint);
        return () => {
            canvas.removeEventListener('mousedown', startPaint);
        };
    }, [startPaint]);


    const exitPaint = (event) => {
        const coordinates = getCoordinates(event);
        if (canvasRef.current && startPosition && coordinates) {
            drawRect(startPosition, coordinates)
            setIsPainting(false);
        }
    };

    const paint = (event) => {
        if (isPainting) {
            const newMousePosition = getCoordinates(event);
            if (startPosition && newMousePosition) {
                drawHighLighter(startPosition, newMousePosition);
            }
        }
    };

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        canvas.addEventListener('mouseup', exitPaint);
        canvas.addEventListener('mouseleave', exitPaint);
        return () => {
            canvas.removeEventListener('mouseup', exitPaint);
            canvas.removeEventListener('mouseleave', exitPaint);
        };
    }, [exitPaint]);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        canvas.addEventListener('mousemove', paint);
        return () => {
            canvas.removeEventListener('mousemove', paint);
        };
    }, [paint]);

    const getCoordinates = (event) => {
        if (!canvasRef.current) {
            return;
        }

        const canvas = canvasRef.current;
        return { x: event.pageX - canvas.offsetLeft, y: event.pageY - canvas.offsetTop };
    };

    const drawHighLighter = (originalMousePosition, newMousePosition) => {
        
        if (canvasRef.current && isPainting) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                context.beginPath();
                if (lastPosition) {
                    context.clearRect(originalMousePosition.x, originalMousePosition.y, (newMousePosition.x - originalMousePosition.x), (newMousePosition.y - originalMousePosition.y));
                }
                context.rect(originalMousePosition.x, originalMousePosition.y, (newMousePosition.x - originalMousePosition.x), (newMousePosition.y - originalMousePosition.y));
                context.fillStyle = "rgba(255, 0, 0, 0.1)";
                context.fill();
                context.closePath();
                setLastPosition(newMousePosition);
            }
        }
    };
    

    const drawRect = (originalMousePosition, newMousePosition) => {
        
        if (canvasRef.current && isPainting) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {


                context.beginPath();
                context.rect(originalMousePosition.x, originalMousePosition.y, (newMousePosition.x - originalMousePosition.x), (newMousePosition.y - originalMousePosition.y));
                context.strokeStyle = 'red';
                context.closePath();
                context.stroke();

                
            }
        }
    };



    return <canvas ref={canvasRef} style={canvasStyle} />;
};

export default Canvas;
