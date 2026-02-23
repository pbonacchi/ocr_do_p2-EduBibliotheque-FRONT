import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaBibliComponent } from './ma-bibli.component';

describe('MaBibliComponent', () => {
  let component: MaBibliComponent;
  let fixture: ComponentFixture<MaBibliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaBibliComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaBibliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
