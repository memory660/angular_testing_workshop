import { byTestId, createComponentFactory, Spectator } from '@ngneat/spectator';
import { take, toArray } from 'rxjs/operators';

import { CounterComponent } from './counter.component';

const startCount = 123;
const newCount = 456;

describe('CounterComponent with spectator', () => {
  let spectator: Spectator<CounterComponent>;

  // --> (1)
  function expectCount(count: number): void {
    expect(spectator.query(byTestId('count'))).toHaveText(String(count)); // <strong data-testid="count">{{ count }}</strong>
  }

  const createComponent = createComponentFactory({
    component: CounterComponent,
    shallow: true,
  });

  beforeEach(() => {
    spectator = createComponent({ props: { startCount } }); //   @Input() public startCount = 0;
  });

  it('shows the start count', () => {
    expectCount(startCount); // (1)
  });

  it('increments the count', () => {
    spectator.click(byTestId('increment-button')); // <button (click)="increment()" data-testid="increment-button">+</button>
    expectCount(startCount + 1); // (1)
  });

  it('decrements the count', () => {
    spectator.click(byTestId('decrement-button'));
    expectCount(startCount - 1); // (1)
  });

  it('resets the count', () => {
    spectator.click(byTestId('decrement-button'));
    spectator.typeInElement(String(newCount), byTestId('reset-input')); // <input type="number" #resetInput data-testid="reset-input" />
    spectator.click(byTestId('reset-button')); // <button (click)="reset(resetInput.value)" data-testid="reset-button">Reset</button>
    expectCount(newCount); // (1)
  });

  it('does not reset if the value is not a number', () => {
    const value = 'not a number';
    spectator.typeInElement(String(value), byTestId('reset-input'));
    spectator.click(byTestId('reset-button'));
    expectCount(startCount); // (1)
  });

  it('emits countChange events', () => {
    let actualCounts: number[] | undefined;
    spectator.component.countChange.pipe(take(3), toArray()).subscribe((counts) => {
      actualCounts = counts;
    });

    spectator.click(byTestId('increment-button')); // 124
    spectator.click(byTestId('decrement-button')); // 123
    spectator.typeInElement(String(newCount), byTestId('reset-input')); // 456
    spectator.click(byTestId('reset-button'));

    expect(actualCounts).toEqual([startCount + 1, startCount, newCount]); // 124 123 456
  });
});
