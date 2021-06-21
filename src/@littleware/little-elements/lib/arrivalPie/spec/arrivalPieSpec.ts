import { sleep } from '../../../common/mutexHelper.js';
import { getStage } from '../../test/util.js';
import ArrivalPie, { arrivalListToString, buildPath, stringToArrivalList } from '../arrivalPie.js';

describe('the littleware.arrivalPie custom element', () => {
  it('Can convert between an arrival-list and an attribute string', () => {
    const arrList = [
      { startAngle: 10, durationDegrees: 20 },
      { startAngle: 40, durationDegrees: 50 },
    ];
    const arrStr = arrivalListToString(arrList);
    expect(arrStr).toBe(arrivalListToString(stringToArrivalList(arrStr)));
  });

  it('Has a static observedAttributes property', () => {
    const propList = ArrivalPie.observedAttributes;
    expect(propList.length).toBe(1);
    expect(propList[0]).toBe('arrival-list');
  });

  it('Can allocate an ArrivalPie object', () => {
    const pie = new ArrivalPie();
    expect(pie).toBeDefined();
  });

  it("Listens for attribute change events on 'arrival-list' attribute", (done) => {
    const pie = new ArrivalPie();
    const stage = getStage('changeCallback', 'Testing attributeChangedCallback');
    stage.appendChild(pie);
    spyOn(pie, '_render').and.callThrough();
    pie.setAttribute('arrival-list', '30,30;');
    sleep(20).then( // give browser chance to render
      () => {
        expect((pie._render as any)).toHaveBeenCalled();
        done();
      },
    );
  });

  it('Can build a path from an arrival', () => {
    const arr = { startAngle: 10, durationDegrees: 30 };
    const path = buildPath(arr);

    expect(path.getAttribute('d').indexOf('M50,50 L50,5 A45,45 0 0,1')).toBe(0);
  });

  it('Can render an ArrivalPie with a couple arrivals', (done) => {
    const stage = getStage('pie1', 'ArrivalPie - 2 arrivals');
    const pie = document.createElement('lw-arrival-pie');
    // 6 degrees === 1 minute
    stage.appendChild(pie);
    pie.setAttribute('arrival-list', '20,6;50,6');
    // Give browser chance to render
    sleep(20).then(
      () => {
        expect(pie.querySelectorAll('path').length).toBe(2);
        done();
      },
    );
  });
});
