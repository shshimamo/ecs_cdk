module Api
  module V1
    class TasksController < ApplicationController
      def index
        if Task.count == 0
          Task.create!(title: 'title a')
          Task.create!(title: 'title b')
          Task.create!(title: 'title c')
        end
        render json: { tasks: Task.all.to_json }
      end
    end
  end
end
