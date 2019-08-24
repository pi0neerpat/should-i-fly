import { LitElement, html, customElement } from 'lit-element';
import axios from 'axios';
import FastAverageColor from 'fast-average-color';
const ac = new FastAverageColor();

type data = {
  airportCode: string;
  webcams: string[];
  report: any;
};

@customElement('should-i-fly')
export class ShouldIFly extends LitElement {
  /** client to communicate with the IDE */
  private data: data = {
    airportCode: '',
    webcams: ['./background.png'],
    report: {}
  };
  private alerts: any = {};

  constructor() {
    super();
    this.init();
  }

  async init() {}

  /** ⚠️ If you're using LitElement you should disable Shadow Root ⚠️ */
  createRenderRoot() {
    return this;
  }

  async getReport() {
    const item = <HTMLDivElement>document.getElementById('gradientContainer');
    const image = <HTMLImageElement>document.getElementById('webcam');
    const isBottom = true;
    const gradient = <HTMLDivElement>document.getElementById('gradient');
    const height = image.naturalHeight;
    const size = 50;
    const color = ac.getColor(
      image,
      isBottom ? { top: height - size, height: size } : { height: size }
    );
    const colorEnd = [].concat(color.value.slice(0, 3), 0).join(',');

    item.style.background = color.rgb;
    item.style.color = color.isDark ? 'white' : 'black';

    if (isBottom) {
      gradient.style.background =
        'linear-gradient(to bottom, ' +
        'rgba(' +
        colorEnd +
        ') 0%, ' +
        color.rgba +
        ' 100%)';
    } else {
      gradient.style.background =
        'linear-gradient(to top, ' +
        'rgba(' +
        colorEnd +
        ') 0%, ' +
        color.rgba +
        ' 100%)';
    }
    try {
      this.data.airportCode = (<HTMLInputElement>(
        document.getElementById('airportCode')
      )).value;
      if (this.data.airportCode.trim() === '') {
        throw new Error('Please enter an airport');
      }
      // Get the webcam and set background color
      axios
        .get(`https://api.weatherusa.net/feed?type=skycams&q=40.00,-83.02`, {})
        .then(res => {
          // this.data.webcams = res.data.reduce((acc, data) => {
          // return acc.concat(data.image);
          // });
          this.showAlert();
        })
        .catch(err => {
          throw err.message;
        });
    } catch (err) {
      this.showAlert(err);
    }
  }

  showAlert(err?: string) {
    if (!err) {
      const message = 'Success!';
      this.alerts = { message, type: 'success' };
    } else {
      const message = `${err}`;
      this.alerts = { message, type: 'warning' };
    }
    this.requestUpdate();
    setTimeout(() => {
      this.alerts = {};
      this.requestUpdate();
    }, 3000);
  }

  render() {
    const isData = this.data.webcams.length > 0;

    const form = html`
      <div class="form-group">
        <label for="airportCode">Airport: </label>
        <input
          type="text"
          class="form-control"
          id="airportCode"
          placeholder="BNA"
        />
      </div>
      <button
        type="submit"
        style="margin:10px 0 3px 0"
        class="btn btn-lg btn-primary mb-2"
        @click="${() => this.getReport()}"
      >
        GO
      </button>
    `;

    const report = isData
      ? html`
          <h1>${this.data.airportCode}</h1>
          <h1>👍/👎</h1>
        `
      : html``;

    const alerts = html`
      <div
        class="alert alert-${this.alerts.type}"
        role="alert"
        ?hidden="${Object.keys(this.alerts).length === 0}"
        style="margin-top:10px"
      >
        ${this.alerts.message}
      </div>
    `;

    // const img = html`
    //   <div class="item item_bottom">
    //     <div class="item__image">
    //       <img src="${this.data.webcams[0]}" />
    //       <div class="item__gradient"></div>
    //     </div>
    //     <div class="item__text">
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
    //       eiusmod tempor incididunt ut labore et dolore magna aliqua.
    //     </div>
    //   </div>
    // `;

    return html`
      <style>
        main {
          padding: 10px;
        }
        #alerts {
          margin-top: 20px;
          font-size: 0.8rem;
        }
        .alert {
          animation: enter 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
        }

        @keyframes enter {
          0% {
            opacity: 0;
            transform: translateY(50px) scaleY(1.2);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
        }
      </style>

      <main>
        ${form} ${report} ${alerts}
        <div class="item item_bottom" id="gradientContainer">
          <div class="item__image">
            <img src="${this.data.webcams[0]}" id="webcam" />
            <div class="item__gradient" id="gradient"></div>
          </div>
          <div class="item__text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </div>
        </div>
      </main>
    `;
  }
}
