import path from 'path';
import { getFileNames, getModules, readDir } from 'utils';

function backgroundRunnerRegister(listenersPath: string): void {
  const fileList = readDir(listenersPath);
  const fileNames = getFileNames(fileList);
  const eventHandlers = readDir(listenersPath).map(file => {
    const filePath = path.join(listenersPath, file);
    return [getModules(filePath).default, getModules(filePath).INTERVAL];
  });

  fileNames.forEach((name, index) => {
    setInterval(eventHandlers[index][0], eventHandlers[index][1]);
  });
}

export default backgroundRunnerRegister;
