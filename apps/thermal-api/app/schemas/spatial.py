from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class FacilityProperties(BaseModel):
    osm_id: Optional[Union[int, str]] = None
    facility_name: str
    category: str
    operator: Optional[str] = "N/A"
    last_updated: Optional[str] = None


class GeoJSONGeometry(BaseModel):
    type: str
    coordinates: Any


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: FacilityProperties


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    metadata: Optional[Dict[str, Any]] = None
    features: List[GeoJSONFeature] = Field(default_factory=list)
