import {Component, Input, OnInit} from '@angular/core';
import { AppConfig } from '../../../app.config';
import { FilterOptionsDialogComponent } from './filter-options-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RestaurantsService } from '../restaurants.service';
import { Router } from '@angular/router';
import { LocationService } from '../../../core/location.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'rd-filter-btn',
  templateUrl: './filter-btn.component.html'
})
export class FilterBtnComponent implements OnInit {

  @Input() filterOn = false;
  @Input() searchFilter: any;
  @Input() view = 'list';

  showFilterOptions = false;
  userPosition: any;
  geoTarget: any;
  resultsLoaded$: Observable<any>;

  constructor(
    public config: AppConfig,
    private dialog: MatDialog,
    private restService: RestaurantsService,
    private router: Router,
    private location: LocationService


  ) {
    this.resultsLoaded$ = this.restService.resultsLoaded;
    this.searchFilter = this.restService.searchParams.filterText;
  }

  ngOnInit(): void {
    // Observe user position
    this.location.userLocationObs.subscribe(pos => this.userPosition = pos );
    // Current geoTarget
    this.geoTarget = this.restService.geo;
    // Delay the filter options until results have loaded
    setTimeout(() => {
      this.showFilterOptions = this.restService.cuisineSummary.length > 1;
      }, 2000);

  }

  // Sort and filter dialog
  openFilterOptions(): void {
    const dialogRef = this.dialog.open(FilterOptionsDialogComponent, {
      data: {
        cuisines: this.restService.cuisineSummary,
        landmarks: this.restService.landmarkSummary,
        userPosition: this.userPosition
      },
      panelClass: 'rd-filter-dialog'
    });
    dialogRef.afterClosed().subscribe((query: any) => {

      // Guard clause
      if (!query) { return;}
      //this.restService.resetSearchFilters();
      this.restService.searchFilter = query.cuisine;

      if (query.type === 'filter') {
        this.router
          .navigate(
            ['/restaurants', this.view, this.restService.geoCoords, query.cuisine],
            { queryParams: { location: this.geoTarget.label }})
          .then(() => console.log(`Filtered by ${query.cuisine}`));
      } else {
        this.router
          .navigate(
            ['/restaurants', 'map', `${query.lat},${query.lng}`],
            { queryParams: { location: query.label }})
          .then(() => console.log('No cuisine filter'));
      }
    });
  }

  // If we have multiple cuisine types
  // or multiple POIs show filter options
  // showFilterBtn(): void {
  //   if (this.cuisines.length > 1 || this.landmarks.length) {
  //     this.showFilterOptions = true;
  //   } else {
  //     console.log('No filters available');
  //   }
  // }

  clearFilters(): void {
    this.restService.searchParams = {
      lat: this.geoTarget.lat,
      lng: this.geoTarget.lng,
      filter: null,
      filterText: null,
      location: this.geoTarget.label
    }
    //this.ngOnInit();
    this.router.navigate(['/restaurants', this.view, `${this.geoTarget.lat},${this.geoTarget.lng}`])
    // this.filtersOn = false;
    // this.showFilterOptions = false;
    // this.showFilterBtn();
  }

}