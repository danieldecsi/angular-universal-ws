import { Component, OnInit, Inject, Renderer2, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchControl = new FormControl('');
  repositories$: Observable<any[]>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: string,
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Do something only in the browser.
    }

    this.repositories$ = this.searchControl.valueChanges.pipe(
      startWith(null),
      switchMap(() => {
        const keyword = this.searchControl.value;

        this.router.navigate([''], { queryParams: { keyword }});

        if (!keyword) {
          return of([]);
        } else {
          return this.getRepositories(keyword);
        }
      }),
    );

    const initialKeyword = this.activatedRoute.snapshot.queryParams.keyword;

    if (initialKeyword) {
      this.searchControl.setValue(initialKeyword);
    }

    const element = this.renderer.createElement('div');
    this.renderer.appendChild(element, this.renderer.createText('Hello World'));
    this.renderer.appendChild(this.document.body, element);
  }

  private getRepositories(keyword: string): Observable<any> {
    return this.httpClient
      .get<any>(`https://api.github.com/search/repositories?q=${keyword}&per_page=25&sort=stars`)
      .pipe(map(response => response.items));
  }

}
