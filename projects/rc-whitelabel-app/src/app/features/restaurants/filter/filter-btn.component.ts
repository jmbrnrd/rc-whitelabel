import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Output() onMapUpdate = new EventEmitter<number>();

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

    // TODO: This could do with being a bit more intelligent
    // ie. only shpw cuisine filters if there are sensible choices to be made
    // Delay the filter options until results have loaded
    setTimeout(() => {
      this.showFilterOptions = true;
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

      this.onMapUpdate.emit(0);

      if (query.type === 'filter') {
        this.router
          .navigateByUrl(
          `/restaurants/${this.view}/${this.restService.geoCoords}/${query.cuisine}?location=${this.geoTarget.label}`)
          .then(() => console.log(`Filtered by ${query.cuisine}`));
      } else {
        if (query.lat == this.restService.geoLatitude && query.lng == this.restService.geoLongitude) {
          console.log(`No change`);
          this.onMapUpdate.emit(1);
          return;
        }

        const loc = query.label ?? 'Your Location';

        this.router
          .navigateByUrl(
            `/restaurants/map/${query.lat},${query.lng}?location=${loc}`)
          .then(() => {
            console.log('No cuisine filter');
          });
      }
    });
  }

  clearFilters(): void {
    this.restService.searchParams = {
      lat: this.geoTarget.lat,
      lng: this.geoTarget.lng,
      filter: null,
      filterText: null,
      location: this.geoTarget.label
    }
    this.router.navigate(
      ['/restaurants', this.view, `${this.geoTarget.lat},${this.geoTarget.lng}`],
      { queryParams: { location: this.geoTarget.label }})
  }

}
