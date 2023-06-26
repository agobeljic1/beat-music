import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { Dots } from './interfaces/dots.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('progress') progressEl!: ElementRef;
  timeline!: gsap.core.Timeline;
  dots: Dots = {
    kick: [],
    hat: [],
    snare: [],
    perc: [],
  };
  numberOfDots = 16;

  // Add initial dots
  ngAfterViewInit(): void {
    // Iterate over the properties
    for (const key in this.dots) {
      if (this.dots.hasOwnProperty(key)) {
        const currentArray = this.dots[key as keyof Dots];

        for (let i = 0; i < this.numberOfDots; i++)
          currentArray.push({ active: false });
      }
    }

    this.playAudio();
  }

  calculateMiddlePoints() {
    const segmentSize = 100 / this.numberOfDots;
    const middlePoints = [];

    for (let i = 1; i <= this.numberOfDots; i++) {
      const middlePoint = i * segmentSize;
      middlePoints.push(middlePoint * 0.01);
    }

    return middlePoints;
  }

  runScriptAtMilestone(milestone: number) {
    // Iterate over the properties
    for (const key in this.dots) {
      if (this.dots.hasOwnProperty(key)) {
        if (this.dots[key as keyof Dots][milestone].active) {
          this.playInstrument(key);
        }
      }
    }
  }

  resetTL() {
    if (this.timeline && this.timeline.isActive()) {
      this.timeline.clear();
      this.timeline.restart();
    }
  }

  playAudio() {
    this.resetTL();

    const percentages = this.calculateMiddlePoints();

    this.timeline = gsap.timeline({ repeat: -1 });
    this.timeline.set(this.progressEl.nativeElement, {
      left: 0,
    });

    const progressEl = this.progressEl.nativeElement;
    this.timeline.to(progressEl, {
      left: '100%',
      duration: 3,
      ease: 'none',
    });

    // Run a script every n% of the timeline
    percentages.forEach((milestone, index) => {
      const time = this.timeline.duration() * milestone;
      this.timeline.call(
        () => {
          this.runScriptAtMilestone(index);
        },
        undefined,
        time
      );
    });

    // Play the timeline
    this.timeline.play();
  }

  playInstrument(type: string) {
    const audio = new Audio();
    audio.src = `/assets/audio/${type}.wav`;
    audio.play();
  }
}
