import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { roomSchema, type RoomFormData } from '@/lib/validations';
import { useCreateRoom } from '@/hooks/useRooms';
import type { RoomType, RoomStatus } from '@/types/hotel';

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const amenitiesList = ['WiFi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi', 'Balcony', 'Safe', 'Coffee Maker'];

export function AddRoomDialog({ open, onOpenChange }: AddRoomDialogProps) {
  const createRoom = useCreateRoom();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      number: '',
      floor: 1,
      type: 'single',
      status: 'available',
      pricePerNight: 100,
      maxOccupancy: 2,
      amenities: [],
      description: '',
    },
  });

  const watchType = watch('type');
  const watchStatus = watch('status');

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => {
      const newAmenities = prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity];
      setValue('amenities', newAmenities);
      return newAmenities;
    });
  };

  const onSubmit = async (data: RoomFormData) => {
    try {
      await createRoom.mutateAsync({ ...data, amenities: selectedAmenities });
      onOpenChange(false);
      reset();
      setSelectedAmenities([]);
    } catch {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
    setSelectedAmenities([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>Create a new room in the hotel inventory</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Room Number *</Label>
              <Input
                id="number"
                placeholder="e.g., 101"
                {...register('number')}
              />
              {errors.number && <p className="text-sm text-destructive">{errors.number.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Floor *</Label>
              <Input
                id="floor"
                type="number"
                placeholder="e.g., 1"
                {...register('floor')}
              />
              {errors.floor && <p className="text-sm text-destructive">{errors.floor.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select value={watchType} onValueChange={(value: RoomType) => setValue('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="presidential">Presidential</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={watchStatus} onValueChange={(value: RoomStatus) => setValue('status', value as 'available' | 'occupied' | 'maintenance' | 'cleaning')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerNight">Price Per Night ($) *</Label>
              <Input
                id="pricePerNight"
                type="number"
                placeholder="e.g., 150"
                {...register('pricePerNight')}
              />
              {errors.pricePerNight && <p className="text-sm text-destructive">{errors.pricePerNight.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxOccupancy">Max Occupancy</Label>
              <Input
                id="maxOccupancy"
                type="number"
                placeholder="e.g., 2"
                {...register('maxOccupancy')}
              />
              {errors.maxOccupancy && <p className="text-sm text-destructive">{errors.maxOccupancy.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-4 gap-2">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <label htmlFor={amenity} className="text-sm cursor-pointer">{amenity}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional room description..."
              {...register('description')}
              rows={2}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={createRoom.isPending}>
              {createRoom.isPending ? 'Adding...' : 'Add Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
