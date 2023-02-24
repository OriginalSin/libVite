import './Notification.css';
// import Utils from '../../Utils.js';
// import icons from '../../svgIcons.js';
let icons = {};
export default class Notification {
    constructor(opt) {
		this.options = opt || {};
		this.timeout = 1000;
		this.el = L.DomUtil.create('div', 'scanex-notify-container', document.body);
    }    
    _remove(el) {
        el.classList.add('closing');
        L.gmxUtil.delay(this.timeout).then(() => el.remove());
    }
    view(text, type = 'error', timeout = 3000) {
        let className = 'scanex-notify noselect opening notify-';
        let notifyIcon = L.gmxUtil.setSVGIcon('notifyError');
        if (type === 'info') {
			className += 'green';
			notifyIcon = L.gmxUtil.setSVGIcon('notifyInfo');
		} else if (type === 'warn') {
			className += 'orange';
			notifyIcon = L.gmxUtil.setSVGIcon('notifyWarn');
		} else {
			className += 'red';
		}
		const node = L.DomUtil.create('div', className, this.el);
        let notifyClose = this.options.closeIcon ? L.gmxUtil.setSVGIcon('notifyClose') : '';
        node.innerHTML = `
            <table cellspacing='0' cellpadding='0'>
                <tr>
                    <td>
                        <div></div>
                    </td>
                    <td class='text'>
                        <div class='message'>${text}</div>
                    </td>
                    <td>
                        <i class='scanex-component-icon scanex-notify-icon notify-${type}'>${notifyIcon}</i>
                    </td>
                </tr>
            </table>
			<i class='scanex-component-icon scanex-notify-icon notify-close'>${notifyClose}</i>
			`;        
        node.querySelector('.notify-close')?.addEventListener('click', e => {
            e.stopPropagation();
            this._remove(node);
        });
        if (timeout) {            
            L.gmxUtil.delay(timeout).then(() => this._remove(node));
        }
		return node;
    }
};

