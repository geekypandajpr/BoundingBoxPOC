import React, { useEffect, useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { usePdf } from '@mikecousins/react-pdf';
import './App.css';

import pdfFile from './sample_pdf.pdf';

function App() {

  const [page, setPage] = useState(1);
  const [startPosition, setStartPosition] = useState();
  const [isPainting, setIsPainting] = useState(false);
  const [ocr, setOcr] = useState('Recognizing...');

  const canvasRef = useRef(null);

  const { pdfDocument, pdfPage } = usePdf({
    file: pdfFile,
    page,
    canvasRef,
  });


  const worker = createWorker({
    // logger: m => console.log(m),
  });
  

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
      if (canvasRef.current && startPosition && coordinates && isPainting) {
          drawRect(startPosition, coordinates)
          setIsPainting(false);
          // Do the extraction part 
          const canvas = canvasRef.current;
          const imageReact = {
            left : startPosition.x,
            top  : startPosition.y,
            width : (coordinates.x - startPosition.x),
            height : (coordinates.y - startPosition.y)
          }
          setOcr('Recognizing...');
          if ( (coordinates.x - startPosition.x) > 0 &&  (coordinates.y - startPosition.y) > 0 ) {
            extractData(canvas, imageReact);
          }

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

      const canvasViewPortHeight = parseFloat(canvas.style.height);
      const canvasViewPortWidth = parseFloat(canvas.style.width);

      const canvasActualHeight = canvas.height;
      const canvasActualWidth = canvas.width;

      return { 
        x: ((event.pageX - canvas.offsetLeft) * (canvasActualWidth / canvasViewPortWidth)), 
        y: ((event.pageY - canvas.offsetTop) * (canvasActualHeight / canvasViewPortHeight))
      };
  };

  const drawHighLighter = (originalMousePosition, newMousePosition) => {
      
      if (canvasRef.current && isPainting) {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');

          if (context) {
            context.beginPath();
            context.globalAlpha = 0.1;
            context.strokeRect(originalMousePosition.x, originalMousePosition.y, (newMousePosition.x - originalMousePosition.x), (newMousePosition.y - originalMousePosition.y));
            context.strokeStyle = 'red';
            
          }
      }
  };


  const extractData = async (canvas, coordinate) => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(canvas, {
      rectangle : coordinate
    });
    setOcr(text);
  }
  


  const drawRect = (originalMousePosition, newMousePosition) => {
      
      if (canvasRef.current && isPainting) {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');

          if (context) {

              context.beginPath();
              context.strokeRect(originalMousePosition.x, originalMousePosition.y, (newMousePosition.x - originalMousePosition.x), (newMousePosition.y - originalMousePosition.y));
              context.strokeStyle = 'red';
              context.closePath();
              
          }
      }
  };



  return (
    <div className="App">
      {/* <img src={demoImage} alt="BigCo Inc. logo"/> */}
      
      
      
        <div>
        <p>{ocr}</p>
        {!pdfDocument && <span>Loading...</span>}
        
        <canvas ref={canvasRef}/>
        {Boolean(pdfDocument && pdfDocument.numPages) && (
          <nav>
            <ul className="pager">
              <li className="previous">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </button>
              </li>
              <li className="next">
                <button
                  disabled={page === pdfDocument.numPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

    </div>
  );
}

export default App;
