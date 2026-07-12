const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const target1 = `              <div class="flex-col">
                <details>
                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> AGE-SPECIFIC LIFECYCLE GUIDANCE</summary>`;

const replace1 = `                <details>
                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> AGE-SPECIFIC LIFECYCLE GUIDANCE</summary>`;

const target2 = `                </div>
              </details>
              </div>
              <div class="flex-col">
                <details>
                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> HEALTHCARE LIABILITY INSULATION</summary>`;

const replace2 = `                </div>
              </details>
                <details>
                <summary><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" style="margin-right: 8px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> HEALTHCARE LIABILITY INSULATION</summary>`;

const target3 = `                </div>
              </details>
              </div>
            </div>
          </div>
<div class="card p-6 mt-4 border border-red-100 bg-red-50 rounded-lg">`;

const replace3 = `                </div>
              </details>
            </div>
          </div>
<div class="card p-6 mt-4 border border-red-100 bg-red-50 rounded-lg">`;

html = html.replace(target1, replace1);
html = html.replace(target2, replace2);
html = html.replace(target3, replace3);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed gaps successfully');
