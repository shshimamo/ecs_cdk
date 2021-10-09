module Api
  module V1
    class TasksController < ApplicationController
      def index
        render json: { tasks: Task.all.to_json }
      end
    end
  end
end
