import React, { useState, useEffect } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

const url = 'http://localhost:8000';

function App() {
  const [acc, setAcc] = useState({ canvas: {}, lines: [], rectangles: [], busketfill: {} });
  const [picture, setPicture] = useState([]);
  const [fileState, setFile] = useState('');
  let canvasWithLines = [];
  let showLines = [];
  let showRectangle = []
  let showBusketFill = '';
  let canvasWithRectangle = [];
  let canvasWithBusketFill = '';
  let startline = 0;
  let startrectangle = 0;
  let file;

  let stringFromTask = '';
  function InputData() {
    setPicture('');
    stringFromTask = document.getElementById('input-id').value;
    parseInputString();
  }
  async function parseInputString(stringValue) {
    const array = stringFromTask ? stringFromTask.split(' ') : stringValue.split(' ');
    let pictureResult = [];
    for (let element of array) {
      switch (element) {
        case 'C':
          const canvasindex = array.indexOf('C', 0);
          acc.canvas.width = +array[canvasindex + 1] + 2;
          acc.canvas.height = array[canvasindex + 2];
          setAcc(acc);
          pictureResult = getCanvas();
          setPicture(`${pictureResult.join('')}`);
          break;
        case 'L':
          if (startline === 0) {
            startline = array.indexOf('L');
          }
          const lineindex = array.indexOf('L', startline);
          acc.lines.push({ x1: array[lineindex + 1], y1: array[lineindex + 2], x2: array[lineindex + 3], y2: array[lineindex + 4] })
          setAcc(acc);
          const newCanvas = pictureResult;
          canvasWithLines = getLines(newCanvas);
          showLines.push(`\n${canvasWithLines.join('')}`)
          setPicture(`${pictureResult.join('')}${showLines.join('')}`);
          startline++
          break;
        case 'R':
          if (startrectangle === 0) {
            startrectangle = array.indexOf('R')
          }
          const rectangleindex = array.indexOf('R', startrectangle)
          acc.rectangles.push({ x1: array[rectangleindex + 1], y1: array[rectangleindex + 2], x2: array[rectangleindex + 3], y2: array[rectangleindex + 4] })
          setAcc(acc);

          const newCanvas2 = canvasWithLines;
          canvasWithRectangle = getRectangle(newCanvas2);
          showRectangle.push(`\n${canvasWithRectangle.join('')}`)
          setPicture(`${pictureResult.join('')}${showLines.join('')}\n${showRectangle.join('')}`)
          startrectangle++;
          break;
        case 'B':
          const busketfillindex = array.indexOf('B', 0);
          acc.busketfill.x = array[busketfillindex + 1];
          acc.busketfill.y = array[busketfillindex + 2];
          acc.busketfill.marker = array[busketfillindex + 3]
          setAcc(acc)
          const newCanvas3 = canvasWithRectangle;
          canvasWithBusketFill = getBusketFill(newCanvas3).join('');
          showBusketFill = canvasWithBusketFill
          setPicture(`${pictureResult.join('')}\n${showLines.join('')}\n${showRectangle.join('')}\n${showBusketFill}`);
      }
    }
    setAcc({ canvas: {}, lines: [], rectangles: [], busketfill: {} })
  }

  const getCanvas = () => {
    const borderLine = '-'.repeat(acc.canvas.width);
    const internalLine = [];
    for (let i = 1; i <= acc.canvas.height; i++) {
      internalLine.push('\n|' + ' '.repeat(acc.canvas.width - 2) + '|');
    }
    return [borderLine, ...internalLine, `\n${borderLine}`];
  }
  const getLines = (linesArray) => {
    const lines = acc.lines;
    let linesArrayTemp = linesArray;

    lines.forEach((lineInfo) => {
      linesArrayTemp = linesArrayTemp.map((string, index) => {
        if (+index >= +lineInfo.y1 && +index <= +lineInfo.y2) {
          string = string.split('');
          for (let element = +lineInfo.x1 + 1; element <= (+lineInfo.x2 + 1); element++) {
            if (string[element] === ' ') {
              string[element] = 'x';
            }
            else if (string[element] === 'x') {
              string[element] = 'x';
            }
          }
          string = string.join('');
          return string;
        }
        return string;
      });
    });
    return linesArrayTemp;
  };
  const getRectangle = (linesArray) => {
    const rectangles = acc.rectangles;
    let linesArrayTemp = linesArray;
    rectangles.forEach((rectangleInfo) => {
      linesArrayTemp = linesArrayTemp.map((string, index) => {
        if (+index === +rectangleInfo.y1 || +index === +rectangleInfo.y2) {
          string = string.split('');

          for (let element = +rectangleInfo.x1 + 1; element <= +rectangleInfo.x2 + 1; element++) {
            if (string[element] === ' ') {
              string[element] = 'x';
            }
            else if (string[element] === 'x') {
              string[element] = 'x';
            }
          }
          string = string.join('');
          return string;
        }
        else if (+index >= +rectangleInfo.y1 && +index <= +rectangleInfo.y2) {
          string = string.split('');
          for (let element = +rectangleInfo.x1 + 1; element <= +rectangleInfo.x2 + 1; element++) {
            if (string[element] === ' ') {
              if (element === +rectangleInfo.x1 + 1 || element === +rectangleInfo.x2 + 1) {
                string[element] = 'x';
              }
            }
            else if (string[element] === 'x') {
              string[element] = 'x';
            }
          }

          string = string.join('');
          return string;
        }
        return string;
      })
    });
    return linesArrayTemp;
  };
  const getBusketFill = (linesArray) => {
    let linesArrayTemp = linesArray;

    const paintToX = (lineAsArray) => {
      let xWasMet = false;
      const indexOfPoint = lineAsArray.findIndex((symb) => symb === 'p' || symb === 'r');
      return lineAsArray.map((symbol, index) => {
        if (index >= indexOfPoint && !xWasMet) {
          if (symbol === 'x' || symbol === '|' || symbol === '-' || symbol === '\n') {
            xWasMet = true;
            return symbol;
          } else if (symbol === 'p' || symbol === 'r') {
            return symbol;
          }
          return acc.busketfill.marker;
        }
        return symbol;
      });
    }

    const markPoint = (array) => {
      return array.map((line, index) => {
        const lineArray = line.split('');
        if (index === +acc.busketfill.y) {
          lineArray[+acc.busketfill.x] = 'p';
        }
        return lineArray.join('');
      })
    }

    const drawBorder = (lineArrayForPoint) => {
      let xWasMet = false;
      let pointIndex;
      lineArrayForPoint.forEach((line, index) => {
        const lineArray = line.split('');
        if (lineArray.find((symbol) => symbol === 'p')) {
          pointIndex = index;
        }
      });
      return lineArrayForPoint.map((line, index) => {
        const lineArray = line.split('');
        if (index >= pointIndex && !xWasMet && lineArray[+acc.busketfill.x] !== 'x' && lineArray[index - 1] !== '-' && lineArray[+acc.busketfill.x] !== 'p') {
          lineArray.splice(+acc.busketfill.x, 1, 'r');
        } else if (lineArray[index - 1] === 'x') {
          xWasMet = true;
        }
        return lineArray.join('');
      });
    }

    const markRows = (linesArrayData) => {
      const withBorder = drawBorder(linesArrayData);
      withBorder.reverse();
      const withAnotherBorder = drawBorder(withBorder);
      withAnotherBorder.reverse();
      return withAnotherBorder;
    }
    const arraywithPoint = markPoint(linesArrayTemp);
    const arr = markRows(arraywithPoint);

    return arr.map((line) => {
      const lineArray = line.split('');
      const newLineArray = paintToX(lineArray);
      const alsoNewLine = paintToX(newLineArray.reverse());
      const findLine = alsoNewLine.map((symbol) => symbol === 'p' || symbol === 'r' ? acc.busketfill.marker : symbol);
      return findLine.reverse().join('');
    });
  }


  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const onChangeHandler = async (event) => {
    file = event.target.files[0];
    setFile(file);
  }

  async function sendFile() {
    const formData = new FormData();
    formData.append('file', fileState);
    if (fileState) {
      return fetch(`${url}/sendfile`, {
        method: 'POST',
        body: formData,
      });
    }
  };
  const sendInputFile = async () => {
    const response = await sendFile();
    if (response) {
      const responseJson = await response.json();
      parseInputString(responseJson.value);      
    }
    setFile();
  }

  const clearField = () => {
    setPicture([]);
  }

  const handleChangeTextArea = (event) => {
    setPicture(event.target.value);
  }

  return (
    <div className="App">
      <div>
        <AppBar position="static">
          <Tabs centered variant="fullWidth" value={value} onChange={handleChange} aria-label="simple tabs example">
            <Tab label="Input data" id={0} onClick={clearField} />
            <Tab label="Input file" id={1} onClick={clearField} />
          </Tabs>
        </AppBar>
        <div
          hidden={value !== 0}
          id={0}
          role="tabpanel"
          value={value}
          index={0}
        >
          <TextField className='InputData' label='Input' variant="outlined"
            name='input' id='input-id'>
          </TextField>
          <Button variant="contained" color="default" size="large" name='button_send_coordinates'
            onClick={InputData} className='button'>
            draw
          </Button>
        </div>
        <div
          hidden={value !== 1}
          id={1}
          role="tabpanel"
          value={value}
          index={1}
        >
          <input type="file" name="file" onChange={onChangeHandler} filename={fileState}/>
          <Button variant="contained" color="default" size="large" name='sendFile'
            onClick={sendInputFile} className='button'>Paint File</Button>
        </div>
      </div>
      <div>
        <TextareaAutosize className="textarea" aria-label="output" value={picture} onChange={handleChangeTextArea} />
        <Button variant="contained" color="default" size="large" name='clearField'
          onClick={clearField} className='button'>Clear Text Field</Button>
      </div>
    </div>
  );
}
export default App;