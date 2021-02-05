import { useDispatch, useSelector } from '@hooks';
import { matchCouple } from 'core/store/actions';
import { selectMatchQueue } from 'core/store/selectors';

const INTERVAL = 5000;

function coupleMatcher() {
  const matchQueue = useSelector(selectMatchQueue);
  if (matchQueue.length < 2) return;

  // Continue handle
  const dispatch = useDispatch();
  let halfListLength = Math.round(matchQueue.length / 2 - 1);
  let i = 0;
  while (i < halfListLength) {
    const [first, sec] = getTwoRandomNumber(matchQueue.length - 1);
    dispatch(matchCouple(matchQueue[first], matchQueue[sec]));
    matchQueue.splice(first, 1);
    matchQueue.splice(sec, 1);
    halfListLength = Math.round(matchQueue.length / 2 - 1);
    i++;
  }
}

export default coupleMatcher;
export { INTERVAL };

///////////////////////////////////////////////////////////////////////////

const randomInRange = (range: number) => Math.round(Math.random() * range);

const getTwoRandomNumber = (range: number) => {
  const firstRandomNumber = randomInRange(range);
  let secRandomNumber = randomInRange(range);

  // Make sure it not duplicated
  while (secRandomNumber === firstRandomNumber) {
    secRandomNumber = randomInRange(range);
  }

  return [firstRandomNumber, secRandomNumber];
};
